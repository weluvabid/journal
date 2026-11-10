import {
  createProgressSnapshot,
  parseProgressSnapshot,
  PROGRESS_STORAGE_KEY,
  LEGACY_PROGRESS_STORAGE_KEY,
  type ProgressSnapshot,
} from './model.ts';

export type ProgressReadResult =
  | { readonly ok: true; readonly snapshot: ProgressSnapshot }
  | { readonly ok: false; readonly reason: 'unavailable' | 'invalid-data' };

function isExpectedStorageFailure(error: unknown): boolean {
  return (
    error instanceof DOMException && ['QuotaExceededError', 'SecurityError'].includes(error.name)
  );
}

/** Access localStorage lazily because browsers may deny access in restricted contexts. */
export function getProgressStorage(): Storage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'SecurityError') {
      return undefined;
    }

    throw error;
  }
}

export function readProgress(storage: Storage | undefined): ProgressReadResult {
  if (!storage) {
    return { ok: false, reason: 'unavailable' };
  }

  let raw: string | null;
  let legacy = false;

  try {
    raw = storage.getItem(PROGRESS_STORAGE_KEY);

    if (raw === null) {
      raw = storage.getItem(LEGACY_PROGRESS_STORAGE_KEY);
      legacy = raw !== null;
    }
  } catch (error) {
    if (isExpectedStorageFailure(error)) {
      return { ok: false, reason: 'unavailable' };
    }

    throw error;
  }

  if (raw === null) {
    return { ok: true, snapshot: createProgressSnapshot([]) };
  }

  try {
    const snapshot = parseProgressSnapshot(JSON.parse(raw) as unknown);

    if (legacy) {
      writeProgress(storage, snapshot);
    }

    return { ok: true, snapshot };
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof TypeError || error instanceof RangeError) {
      return { ok: false, reason: 'invalid-data' };
    }

    throw error;
  }
}

export function writeProgress(storage: Storage | undefined, snapshot: ProgressSnapshot): boolean {
  const normalized = parseProgressSnapshot(snapshot);

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(normalized));

    return true;
  } catch (error) {
    if (isExpectedStorageFailure(error)) {
      return false;
    }

    throw error;
  }
}
