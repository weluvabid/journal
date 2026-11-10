import { createProgressSnapshot, MAX_QUESTIONS, type ProgressSnapshot } from './model.ts';

const MAGIC = [0x46, 0x41, 0x54, 0x4c] as const; // FATL
const FORMAT_VERSION = 1;
const HEADER_BYTES = 14;
const CRC_BYTES = 2;
const TIMESTAMP_EPOCH = Date.UTC(2020, 0, 1);

function crc16(bytes: Uint8Array): number {
  let crc = 0xffff;

  for (const byte of bytes) {
    crc ^= byte << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc;
}

function manifestHash(ids: readonly string[]): bigint {
  // FNV-1a 64-bit is an identity fingerprint, not a security primitive.
  let hash = 0xcbf29ce484222325n;

  for (const byte of new TextEncoder().encode(ids.join('\0'))) {
    hash ^= BigInt(byte);
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }

  return hash;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function fromBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) {
    throw new TypeError('QR payload is not valid base64url');
  }

  const base64 =
    value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(base64);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function sortedIds(ids: readonly string[]): string[] {
  if (ids.length > MAX_QUESTIONS) {
    throw new RangeError(`Frontend Atlas supports at most ${MAX_QUESTIONS} questions`);
  }

  if (
    new Set(ids).size !== ids.length ||
    ids.some((id) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id))
  ) {
    throw new TypeError('Question manifest contains duplicate or invalid IDs');
  }

  return [...ids];
}

export function encodeProgressQr(
  snapshot: ProgressSnapshot,
  questionIds: readonly string[],
): string {
  const ids = sortedIds(questionIds);
  const known = new Set(ids);
  const unknown = [...snapshot.completed, ...Object.keys(snapshot.readingProgress)].filter(
    (id) => !known.has(id),
  );

  if (unknown.length) {
    throw new RangeError(
      `Progress references ${unknown.length} question ID(s) outside this manifest`,
    );
  }

  const statusBytes = new Uint8Array(Math.ceil((ids.length * 2) / 8));
  const readingEntries: { index: number; position: number; timestamp: number }[] = [];

  ids.forEach((id, index) => {
    const state = snapshot.completed.includes(id) ? 2 : snapshot.readingProgress[id] ? 1 : 0;

    statusBytes[Math.floor((index * 2) / 8)] |= state << (6 - ((index * 2) % 8));
    const reading = snapshot.readingProgress[id];

    if (reading) {
      const timestamp = Math.floor((Date.parse(reading.updatedAt) - TIMESTAMP_EPOCH) / 1000);

      if (!Number.isSafeInteger(timestamp) || timestamp < 0 || timestamp > 0xffffffff) {
        throw new RangeError(
          'Reading progress timestamp is outside the supported QR range (2020–2155)',
        );
      }

      readingEntries.push({ index, position: reading.position, timestamp });
    }
  });

  const bytes = new Uint8Array(
    HEADER_BYTES + statusBytes.length + 1 + readingEntries.length * 7 + CRC_BYTES,
  );

  bytes.set(MAGIC, 0);
  bytes[4] = FORMAT_VERSION;
  bytes[5] = ids.length;
  let hash = manifestHash(ids);

  for (let offset = 13; offset >= 6; offset -= 1) {
    bytes[offset] = Number(hash & 0xffn);
    hash >>= 8n;
  }

  let cursor = HEADER_BYTES;

  bytes.set(statusBytes, cursor);
  cursor += statusBytes.length;
  bytes[cursor++] = readingEntries.length;

  for (const entry of readingEntries) {
    bytes[cursor++] = entry.index;
    bytes[cursor++] = entry.position >>> 8;
    bytes[cursor++] = entry.position & 0xff;
    bytes[cursor++] = entry.timestamp >>> 24;
    bytes[cursor++] = entry.timestamp >>> 16;
    bytes[cursor++] = entry.timestamp >>> 8;
    bytes[cursor++] = entry.timestamp & 0xff;
  }

  const checksum = crc16(bytes.subarray(0, cursor));

  bytes[cursor++] = checksum >>> 8;
  bytes[cursor] = checksum & 0xff;

  return `FATL1:${toBase64Url(bytes)}`;
}

export function decodeProgressQr(
  payload: string,
  questionIds: readonly string[],
): ProgressSnapshot {
  if (!payload.startsWith('FATL1:')) {
    throw new TypeError('Unsupported Frontend Atlas QR payload');
  }

  const bytes = fromBase64Url(payload.slice(6));

  if (bytes.length < HEADER_BYTES + 1 + CRC_BYTES) {
    throw new RangeError('QR payload is truncated');
  }

  if (!MAGIC.every((byte, index) => bytes[index] === byte)) {
    throw new TypeError('QR payload magic identifier is invalid');
  }

  if (bytes[4] !== FORMAT_VERSION) {
    throw new RangeError(`Unsupported QR format version: ${bytes[4]}`);
  }

  const manifest = sortedIds(questionIds);
  const count = bytes[5];

  if (count > manifest.length) {
    throw new RangeError('QR question count exceeds this handbook manifest');
  }

  const ids = manifest.slice(0, count);
  let expectedHash = 0n;

  for (let index = 6; index < 14; index += 1) {
    expectedHash = (expectedHash << 8n) | BigInt(bytes[index]);
  }

  if (expectedHash !== manifestHash(ids)) {
    throw new RangeError('QR question manifest does not match this handbook');
  }

  const expectedCrc = (bytes[bytes.length - 2] << 8) | bytes[bytes.length - 1];

  if (crc16(bytes.subarray(0, -2)) !== expectedCrc) {
    throw new RangeError('QR integrity check failed');
  }

  const statusLength = Math.ceil((ids.length * 2) / 8);
  let cursor = HEADER_BYTES;

  if (cursor + statusLength + 1 + CRC_BYTES > bytes.length) {
    throw new RangeError('QR status section is truncated');
  }

  const statuses = bytes.subarray(cursor, cursor + statusLength);

  cursor += statusLength;
  const entryCount = bytes[cursor++];

  if (entryCount > ids.length || cursor + entryCount * 7 + CRC_BYTES !== bytes.length) {
    throw new RangeError('QR reading-progress section has an invalid length');
  }

  const completed: string[] = [];
  const readingProgress: Record<string, { position: number; updatedAt: string }> = {};

  ids.forEach((id, index) => {
    const state = (statuses[Math.floor((index * 2) / 8)] >> (6 - ((index * 2) % 8))) & 3;

    if (state === 3) {
      throw new RangeError(`QR contains reserved learning state for question "${id}"`);
    }

    if (state === 2) {
      completed.push(id);
    }
  });
  const seen = new Set<number>();

  for (let entry = 0; entry < entryCount; entry += 1) {
    const index = bytes[cursor++];
    const position = (bytes[cursor++] << 8) | bytes[cursor++];
    const timestamp =
      (bytes[cursor++] * 0x1000000 +
        (bytes[cursor++] << 16) +
        (bytes[cursor++] << 8) +
        bytes[cursor++]) >>>
      0;

    if (index >= ids.length || seen.has(index) || position === 0) {
      throw new RangeError('QR contains an invalid reading-progress entry');
    }

    const state = (statuses[Math.floor((index * 2) / 8)] >> (6 - ((index * 2) % 8))) & 3;

    if (state !== 1 && state !== 2) {
      throw new RangeError('QR reading progress conflicts with its learning state');
    }

    seen.add(index);
    readingProgress[ids[index]] = {
      position,
      updatedAt: new Date(timestamp * 1000 + TIMESTAMP_EPOCH).toISOString(),
    };
  }

  for (let index = 0; index < ids.length; index += 1) {
    const state = (statuses[Math.floor((index * 2) / 8)] >> (6 - ((index * 2) % 8))) & 3;

    if (state === 1 && !seen.has(index)) {
      throw new RangeError('QR in-progress state is missing its reading position');
    }
  }

  return createProgressSnapshot(completed, new Date(), readingProgress);
}
