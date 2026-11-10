import { announceProgressChange, subscribeToProgressChanges } from './events.ts';
import {
  createProgressSnapshot,
  mergeProgressSnapshots,
  parseProgressSnapshot,
  type ProgressSnapshot,
} from './model.ts';
import {
  getProgressStorage,
  readProgress,
  writeProgress,
  type ProgressReadResult,
} from './storage.ts';

let volatileSnapshot: ProgressSnapshot | undefined;

export interface ProgressSaveResult {
  readonly snapshot: ProgressSnapshot;
  readonly persisted: boolean;
}

/** Persist and broadcast a new completion set through the shared progress boundary. */
export function saveProgress(completed: readonly string[]): ProgressSaveResult {
  const storage = getProgressStorage();
  const existing = readProgress(storage);

  if (!existing.ok && existing.reason === 'invalid-data') {
    throw new Error('Cannot save progress: saved progress is invalid');
  }

  const current = existing.ok
    ? existing.snapshot
    : existing.reason === 'unavailable'
      ? volatileSnapshot
      : undefined;
  const snapshot = createProgressSnapshot(completed, new Date(), current?.readingProgress ?? {});
  const persisted = writeProgress(storage, snapshot);

  volatileSnapshot = snapshot;

  announceProgressChange(snapshot);

  return { snapshot, persisted };
}

/** Replace local progress with a previously validated snapshot. */
export function replaceProgress(snapshot: ProgressSnapshot): ProgressSaveResult {
  const normalized = parseProgressSnapshot(snapshot);
  const persisted = writeProgress(getProgressStorage(), normalized);

  volatileSnapshot = normalized;

  announceProgressChange(normalized);

  return { snapshot: normalized, persisted };
}

export function subscribeToProgress(listener: (result: ProgressReadResult) => void): () => void {
  return subscribeToProgressChanges((result) => {
    if (!result.ok && result.reason === 'unavailable' && volatileSnapshot) {
      listener({ ok: true, snapshot: volatileSnapshot });

      return;
    }

    listener(result);
  });
}

/** Toggle one question's completion without duplicating mutation logic in UI components. */
export function toggleQuestionCompletion(
  questionId: string,
  completed: readonly string[],
): ProgressSaveResult {
  const next = new Set(completed);

  if (next.has(questionId)) {
    next.delete(questionId);
  } else {
    next.add(questionId);
  }

  return saveProgress([...next]);
}

/** Save normalized article reading progress without overwriting other question records. */
export function updateQuestionReadingProgress(
  questionId: string,
  position: number,
): ProgressSaveResult {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(questionId)) {
    throw new TypeError('Invalid question id');
  }

  if (!Number.isInteger(position) || position < 0 || position > 65535) {
    throw new RangeError('Reading position must be an integer from 0 to 65535');
  }

  const current = getProgressStorage();
  const existing = readProgress(current);

  if (!existing.ok && existing.reason === 'invalid-data') {
    throw new Error('Cannot update reading progress: saved progress is invalid');
  }

  const currentSnapshot = existing.ok
    ? existing.snapshot
    : existing.reason === 'unavailable'
      ? (volatileSnapshot ?? createProgressSnapshot([]))
      : createProgressSnapshot([]);
  const readingProgress = { ...currentSnapshot.readingProgress };
  const previous = readingProgress[questionId];

  if (position > (previous?.position ?? 0)) {
    readingProgress[questionId] = { position, updatedAt: new Date().toISOString() };
  }

  const snapshot = createProgressSnapshot(currentSnapshot.completed, new Date(), readingProgress);
  const persisted = writeProgress(current, snapshot);

  volatileSnapshot = snapshot;
  announceProgressChange(snapshot);

  return { snapshot, persisted };
}

/** Merge snapshots without regressing completion or per-question reading position. */
export function mergeProgress(incoming: ProgressSnapshot): ProgressSaveResult {
  const normalized = parseProgressSnapshot(incoming);
  const storage = getProgressStorage();
  const existing = readProgress(storage);

  if (!existing.ok && existing.reason === 'invalid-data') {
    throw new Error('Cannot merge progress: saved progress is invalid');
  }

  const currentSnapshot = existing.ok
    ? existing.snapshot
    : existing.reason === 'unavailable'
      ? (volatileSnapshot ?? createProgressSnapshot([]))
      : createProgressSnapshot([]);
  const snapshot = mergeProgressSnapshots(currentSnapshot, normalized);
  const persisted = writeProgress(storage, snapshot);

  volatileSnapshot = snapshot;
  announceProgressChange(snapshot);

  return { snapshot, persisted };
}

/** Clear persisted progress and notify all same-tab subscribers. */
export function clearProgress(): ProgressSaveResult {
  const empty = createProgressSnapshot([]);
  const storage = getProgressStorage();
  let persisted = false;

  if (storage) {
    try {
      storage.removeItem('frontend-atlas:progress:v2');
      storage.removeItem('frontend-atlas:progress:v1');
      persisted = true;
    } catch (error) {
      if (
        !(error instanceof DOMException) ||
        !['QuotaExceededError', 'SecurityError'].includes(error.name)
      ) {
        throw error;
      }
    }
  }

  volatileSnapshot = empty;
  announceProgressChange(empty);

  return { snapshot: empty, persisted };
}
