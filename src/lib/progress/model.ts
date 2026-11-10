import { MAX_QUESTION_COUNT } from '../../data/question-manifest.ts';

export const PROGRESS_VERSION = 2 as const;
export const PROGRESS_STORAGE_KEY = 'frontend-atlas:progress:v2';
export const LEGACY_PROGRESS_STORAGE_KEY = 'frontend-atlas:progress:v1';
export const MAX_QUESTIONS = MAX_QUESTION_COUNT;

export interface ReadingProgress {
  readonly position: number;
  readonly updatedAt: string;
}

export interface ProgressSnapshot {
  readonly version: typeof PROGRESS_VERSION;
  readonly completed: readonly string[];
  readonly readingProgress: Readonly<Record<string, ReadingProgress>>;
  readonly updatedAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateQuestionId(id: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)) {
    throw new TypeError(`Progress contains an invalid question id: ${id}`);
  }
}

export function createProgressSnapshot(
  completed: readonly string[],
  now = new Date(),
  readingProgress: Readonly<Record<string, ReadingProgress>> = {},
): ProgressSnapshot {
  if (Number.isNaN(now.getTime())) {
    throw new RangeError('Progress timestamp must be a valid date');
  }

  const normalized = [...new Set(completed)].sort();

  normalized.forEach(validateQuestionId);

  const positions: Record<string, ReadingProgress> = {};

  for (const [id, reading] of Object.entries(readingProgress).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    validateQuestionId(id);

    if (
      !isRecord(reading) ||
      !Number.isInteger(reading.position) ||
      reading.position < 0 ||
      reading.position > 65535
    ) {
      throw new RangeError(`Reading progress for "${id}" must be an integer from 0 to 65535`);
    }

    if (typeof reading.updatedAt !== 'string' || Number.isNaN(Date.parse(reading.updatedAt))) {
      throw new TypeError(`Reading progress timestamp for "${id}" must be valid`);
    }

    if (reading.position > 0) {
      positions[id] = {
        position: reading.position,
        updatedAt: new Date(reading.updatedAt).toISOString(),
      };
    }
  }

  // Explicit completion means the reader has finished the article. Keep the
  // reading-depth record in sync while leaving completion a separate action.
  for (const id of normalized) {
    const existing = positions[id];

    if (!existing || existing.position < 65535) {
      positions[id] = { position: 65535, updatedAt: now.toISOString() };
    }
  }

  if (new Set([...normalized, ...Object.keys(positions)]).size > MAX_QUESTIONS) {
    throw new RangeError(`Progress cannot contain more than ${MAX_QUESTIONS} questions`);
  }

  return {
    version: PROGRESS_VERSION,
    completed: normalized,
    readingProgress: positions,
    updatedAt: now.toISOString(),
  };
}

export function parseProgressSnapshot(input: unknown): ProgressSnapshot {
  if (!isRecord(input)) {
    throw new TypeError('Progress data must be an object');
  }

  if (input.version !== 1 && input.version !== PROGRESS_VERSION) {
    throw new RangeError(`Unsupported progress version: ${String(input.version)}`);
  }

  if (input.version === 1) {
    if (!Array.isArray(input.completed) || !input.completed.every((id) => typeof id === 'string')) {
      throw new TypeError('Legacy progress completed field must be an array of question ids');
    }

    if (typeof input.updatedAt !== 'string' || Number.isNaN(Date.parse(input.updatedAt))) {
      throw new TypeError('Progress updatedAt field must be a valid timestamp');
    }

    return createProgressSnapshot(input.completed, new Date(input.updatedAt));
  }

  if (!Array.isArray(input.completed) || !input.completed.every((id) => typeof id === 'string')) {
    throw new TypeError('Progress completed field must be an array of question ids');
  }

  if (!isRecord(input.readingProgress)) {
    throw new TypeError('Progress readingProgress field must be an object');
  }

  if (typeof input.updatedAt !== 'string' || Number.isNaN(Date.parse(input.updatedAt))) {
    throw new TypeError('Progress updatedAt field must be a valid timestamp');
  }

  return createProgressSnapshot(
    input.completed,
    new Date(input.updatedAt),
    input.readingProgress as Record<string, ReadingProgress>,
  );
}

export function getInProgressIds(snapshot: ProgressSnapshot): string[] {
  return Object.keys(snapshot.readingProgress)
    .filter((id) => !snapshot.completed.includes(id))
    .sort();
}

/** Merge snapshots while keeping completion and maximum reading depth monotonic. */
export function mergeProgressSnapshots(
  current: ProgressSnapshot,
  incoming: ProgressSnapshot,
  now = new Date(),
): ProgressSnapshot {
  const left = parseProgressSnapshot(current);
  const right = parseProgressSnapshot(incoming);
  const completed = new Set([...left.completed, ...right.completed]);
  const readingProgress = { ...left.readingProgress };

  for (const [id, candidate] of Object.entries(right.readingProgress)) {
    const existing = readingProgress[id];

    if (!existing || candidate.position > existing.position) {
      readingProgress[id] = candidate;
    }
  }

  return createProgressSnapshot([...completed], now, readingProgress);
}
