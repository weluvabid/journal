import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgressSnapshot } from '../src/lib/progress/model.ts';
import { decodeProgressQr, encodeProgressQr } from '../src/lib/progress/qr.ts';

const ids = ['closures', 'event-loop', 'browser-rendering'];

test('QR protocol round-trips completed and in-progress states by stable question ID', () => {
  const snapshot = createProgressSnapshot(['event-loop'], new Date('2026-11-06T00:00:00.000Z'), {
    closures: { position: 32768, updatedAt: '2026-11-05T12:00:00.000Z' },
    'event-loop': { position: 65535, updatedAt: '2026-11-05T13:00:00.000Z' },
  });
  const decoded = decodeProgressQr(encodeProgressQr(snapshot, ids), ids);

  assert.deepEqual(decoded.completed, ['event-loop']);
  assert.deepEqual(decoded.readingProgress, snapshot.readingProgress);
});

test('QR protocol rejects a different question manifest', () => {
  const payload = encodeProgressQr(createProgressSnapshot([]), ids);

  assert.throws(
    () => decodeProgressQr(payload, ['closures', 'event-loop', 'different']),
    /manifest/u,
  );
});

test('QR protocol detects payload corruption before importing progress', () => {
  const payload = encodeProgressQr(createProgressSnapshot(['closures']), ids);
  const replacement = payload[8] === 'A' ? 'B' : 'A';
  const corrupted = `${payload.slice(0, 8)}${replacement}${payload.slice(9)}`;

  assert.throws(() => decodeProgressQr(corrupted, ids), /magic identifier|integrity|base64url/u);
});

test('QR protocol enforces the 150-question editorial cap', () => {
  const ids = Array.from({ length: 151 }, (_, index) => `question-${index}`);

  assert.throws(() => encodeProgressQr(createProgressSnapshot([]), ids), /150 questions/u);
});

test('QR protocol accepts an older append-only manifest prefix', () => {
  const olderIds = ['closures', 'event-loop'];
  const currentIds = [...olderIds, 'browser-rendering'];
  const oldPayload = encodeProgressQr(createProgressSnapshot(['closures']), olderIds);
  const decoded = decodeProgressQr(oldPayload, currentIds);

  assert.deepEqual(decoded.completed, ['closures']);
});

test('QR payload stays compact at the 150-question hard cap with every reading position', () => {
  const ids = Array.from({ length: 150 }, (_, index) => `question-${index}`);
  const readingProgress = Object.fromEntries(
    ids.map((id, index) => [
      id,
      {
        position: index + 1,
        updatedAt: '2026-11-06T00:00:00.000Z',
      },
    ]),
  );
  const snapshot = createProgressSnapshot(
    [],
    new Date('2026-11-06T00:00:00.000Z'),
    readingProgress,
  );
  const payload = encodeProgressQr(snapshot, ids);

  assert.ok(
    payload.length <= 1500,
    `Expected compact payload, received ${payload.length} characters`,
  );
  assert.deepEqual(decodeProgressQr(payload, ids).readingProgress, snapshot.readingProgress);
});

test('QR protocol rejects progress for IDs outside the manifest', () => {
  const snapshot = createProgressSnapshot(['unknown-question']);

  assert.throws(() => encodeProgressQr(snapshot, ids), /outside this manifest/u);
});
