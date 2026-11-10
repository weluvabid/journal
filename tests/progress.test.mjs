import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createProgressSnapshot,
  mergeProgressSnapshots,
  parseProgressSnapshot,
  PROGRESS_STORAGE_KEY,
  readProgress,
  writeProgress,
} from '../src/lib/progress.ts';

function createStorage(initial = null) {
  let value = initial;

  return {
    getItem(key) {
      assert.equal(key, PROGRESS_STORAGE_KEY);

      return value;
    },
    setItem(key, next) {
      assert.equal(key, PROGRESS_STORAGE_KEY);
      value = next;
    },
    get value() {
      return value;
    },
  };
}

test('snapshot normalizes ordering and duplicates', () => {
  const snapshot = createProgressSnapshot(
    ['zeta', 'alpha', 'zeta'],
    new Date('2026-01-01T00:00:00.000Z'),
  );

  assert.deepEqual(snapshot.completed, ['alpha', 'zeta']);
  assert.equal(snapshot.version, 2);
});

test('explicit completion implies 100 percent reading progress', () => {
  const snapshot = createProgressSnapshot(['event-loop'], new Date('2026-01-02T00:00:00.000Z'), {
    'event-loop': { position: 12000, updatedAt: '2026-01-01T00:00:00.000Z' },
  });

  assert.equal(snapshot.readingProgress['event-loop'].position, 65535);
  assert.equal(snapshot.readingProgress['event-loop'].updatedAt, '2026-01-02T00:00:00.000Z');
});

test('snapshot rejects malformed ids and invalid dates', () => {
  assert.throws(() => createProgressSnapshot(['not a valid id']), TypeError);
  assert.throws(() => createProgressSnapshot([], new Date('invalid')), RangeError);
});

test('import rejects unknown schema versions and malformed fields', () => {
  assert.throws(
    () => parseProgressSnapshot({ version: 3, completed: [], updatedAt: new Date().toISOString() }),
    /Unsupported progress version/,
  );
  assert.throws(
    () =>
      parseProgressSnapshot({ version: 1, completed: [4], updatedAt: new Date().toISOString() }),
    /array of question ids/,
  );
  assert.throws(
    () => parseProgressSnapshot({ version: 1, completed: [], updatedAt: 'invalid' }),
    /valid timestamp/,
  );
});

test('storage round-trips valid progress', () => {
  const storage = createStorage();
  const snapshot = createProgressSnapshot(['event-loop']);

  assert.equal(writeProgress(storage, snapshot), true);
  const result = readProgress(storage);

  assert.equal(result.ok, true);
  assert.deepEqual(result.snapshot.completed, ['event-loop']);
});

test('storage reports corrupt JSON without throwing', () => {
  const result = readProgress(createStorage('{broken'));

  assert.deepEqual(result, { ok: false, reason: 'invalid-data' });
});

test('completion updates refuse to overwrite corrupt saved progress', async () => {
  const { toggleQuestionCompletion } = await import('../src/lib/progress/service.ts');
  const originalWindow = globalThis.window;
  const values = new Map([[PROGRESS_STORAGE_KEY, '{broken']]);

  globalThis.window = {
    localStorage: {
      getItem(key) {
        return values.get(key) ?? null;
      },
      setItem(key, value) {
        values.set(key, value);
      },
    },
  };

  try {
    assert.throws(
      () => toggleQuestionCompletion('event-loop-tasks-and-microtasks', []),
      /Cannot save progress: saved progress is invalid/,
    );
    assert.equal(values.get(PROGRESS_STORAGE_KEY), '{broken');
  } finally {
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  }
});

test('storage reports expected browser security failures', () => {
  const storage = {
    getItem() {
      throw new DOMException('blocked', 'SecurityError');
    },
  };

  assert.deepEqual(readProgress(storage), { ok: false, reason: 'unavailable' });
});

test('storage does not swallow unexpected failures', () => {
  const storage = {
    getItem() {
      throw new Error('unexpected storage failure');
    },
  };

  assert.throws(() => readProgress(storage), /unexpected storage failure/);
});

test('storage write returns false for quota failures but propagates unknown failures', () => {
  const quotaStorage = {
    setItem() {
      throw new DOMException('full', 'QuotaExceededError');
    },
  };

  assert.equal(writeProgress(quotaStorage, createProgressSnapshot([])), false);
  const brokenStorage = {
    setItem() {
      throw new Error('unexpected write failure');
    },
  };

  assert.throws(
    () => writeProgress(brokenStorage, createProgressSnapshot([])),
    /unexpected write failure/,
  );
});

test('shared progress service toggles one question without mutating the caller collection', async () => {
  const { toggleQuestionCompletion } = await import('../src/lib/progress/service.ts');
  const initial = ['closures'];
  const added = toggleQuestionCompletion('event-loop', initial);

  assert.deepEqual(added.snapshot.completed, ['closures', 'event-loop']);
  assert.equal(added.snapshot.readingProgress['event-loop'].position, 65535);
  assert.deepEqual(initial, ['closures']);
  assert.equal(added.persisted, false);

  const removed = toggleQuestionCompletion('closures', added.snapshot.completed);

  assert.deepEqual(removed.snapshot.completed, ['event-loop']);
});

test('clearing progress removes both storage versions and publishes an empty snapshot', async () => {
  const { clearProgress, replaceProgress } = await import('../src/lib/progress/service.ts');
  const originalWindow = globalThis.window;
  const values = new Map([
    [PROGRESS_STORAGE_KEY, JSON.stringify(createProgressSnapshot(['event-loop']))],
    ['frontend-atlas:progress:v1', 'legacy'],
  ]);
  let announced;

  globalThis.window = {
    localStorage: {
      getItem(key) {
        return values.get(key) ?? null;
      },
      setItem(key, value) {
        values.set(key, value);
      },
      removeItem(key) {
        values.delete(key);
      },
    },
    dispatchEvent(event) {
      announced = event.detail;

      return true;
    },
  };

  try {
    replaceProgress(createProgressSnapshot(['event-loop']));
    const result = clearProgress();

    assert.equal(result.persisted, true);
    assert.deepEqual(result.snapshot.completed, []);
    assert.deepEqual(result.snapshot.readingProgress, {});
    assert.equal(values.has(PROGRESS_STORAGE_KEY), false);
    assert.equal(values.has('frontend-atlas:progress:v1'), false);
    assert.deepEqual(announced.completed, []);
    assert.deepEqual(announced.readingProgress, {});
  } finally {
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  }
});

test('legacy version 1 progress migrates to the version 2 model', async () => {
  const { parseProgressSnapshot } = await import('../src/lib/progress/model.ts');
  const migrated = parseProgressSnapshot({
    version: 1,
    completed: ['event-loop'],
    updatedAt: '2026-01-01T00:00:00.000Z',
  });

  assert.equal(migrated.version, 2);
  assert.deepEqual(migrated.completed, ['event-loop']);
  assert.equal(migrated.readingProgress['event-loop'].position, 65535);
});

test('volatile fallback preserves completion while reading progress changes without storage', async () => {
  const { replaceProgress, updateQuestionReadingProgress } = await import(
    '../src/lib/progress/service.ts'
  );

  replaceProgress(createProgressSnapshot(['closures']));
  const updated = updateQuestionReadingProgress('event-loop', 12000);

  assert.equal(updated.persisted, false);
  assert.deepEqual(updated.snapshot.completed, ['closures']);
  assert.equal(updated.snapshot.readingProgress['event-loop'].position, 12000);
});

test('progress merge keeps completion and the greatest per-question reading position', () => {
  const current = createProgressSnapshot(['closures'], new Date('2026-11-06T00:00:00.000Z'), {
    'event-loop': { position: 50000, updatedAt: '2026-11-06T00:00:00.000Z' },
  });
  const incoming = createProgressSnapshot(['event-loop'], new Date('2026-11-06T00:00:00.000Z'), {
    'event-loop': { position: 12000, updatedAt: '2026-11-06T00:00:01.000Z' },
    'browser-rendering': { position: 8000, updatedAt: '2026-11-06T00:00:02.000Z' },
  });
  const merged = mergeProgressSnapshots(current, incoming);

  assert.deepEqual(merged.completed, ['closures', 'event-loop']);
  assert.equal(merged.readingProgress['event-loop'].position, 65535);
  assert.equal(merged.readingProgress['browser-rendering'].position, 8000);
});

test('storage migrates the legacy key into the version 2 key on first read', async () => {
  const { LEGACY_PROGRESS_STORAGE_KEY } = await import('../src/lib/progress/model.ts');
  const values = new Map([
    [
      LEGACY_PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        completed: ['closures'],
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    ],
  ]);
  const storage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
  const result = readProgress(storage);

  assert.equal(result.ok, true);
  assert.equal(result.snapshot.version, 2);
  assert.deepEqual(result.snapshot.completed, ['closures']);
  assert.equal(JSON.parse(values.get(PROGRESS_STORAGE_KEY)).version, 2);
});

test('reading progress is monotonic and scrolling backwards never overwrites the maximum', async () => {
  const { replaceProgress, updateQuestionReadingProgress } = await import(
    '../src/lib/progress/service.ts'
  );
  const originalWindow = globalThis.window;
  const values = new Map();

  globalThis.window = {
    localStorage: {
      getItem(key) {
        return values.get(key) ?? null;
      },
      setItem(key, value) {
        values.set(key, value);
      },
      removeItem(key) {
        values.delete(key);
      },
    },
    dispatchEvent() {
      return true;
    },
  };

  try {
    replaceProgress(createProgressSnapshot([]));
    updateQuestionReadingProgress('event-loop', 48000);
    const backwards = updateQuestionReadingProgress('event-loop', 12000);

    assert.equal(backwards.snapshot.readingProgress['event-loop'].position, 48000);
    updateQuestionReadingProgress('event-loop', 0);
    const atTop = readProgress(globalThis.window.localStorage);

    assert.equal(atTop.ok, true);
    assert.equal(atTop.snapshot.readingProgress['event-loop'].position, 48000);

    const forwards = updateQuestionReadingProgress('event-loop', 52000);

    assert.equal(forwards.snapshot.readingProgress['event-loop'].position, 52000);
  } finally {
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  }
});
