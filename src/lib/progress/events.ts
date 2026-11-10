import {
  parseProgressSnapshot,
  PROGRESS_STORAGE_KEY,
  LEGACY_PROGRESS_STORAGE_KEY,
  type ProgressSnapshot,
} from './model.ts';
import { getProgressStorage, readProgress, type ProgressReadResult } from './storage.ts';

export const PROGRESS_CHANGE_EVENT = 'frontend-atlas:progress-change';

export function announceProgressChange(snapshot: ProgressSnapshot): void {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<ProgressSnapshot>(PROGRESS_CHANGE_EVENT, { detail: snapshot }),
  );
}

/** Subscribe to same-tab and cross-tab progress changes; the initial read is emitted immediately. */
export function subscribeToProgressChanges(
  listener: (result: ProgressReadResult) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const storage = getProgressStorage();

  function syncFromStorage(): void {
    listener(readProgress(storage));
  }

  function handleStorageChange(event: StorageEvent): void {
    if (
      event.key !== PROGRESS_STORAGE_KEY &&
      event.key !== LEGACY_PROGRESS_STORAGE_KEY &&
      event.key !== null
    ) {
      return;
    }

    syncFromStorage();
  }

  function handleProgressChange(event: Event): void {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    listener({ ok: true, snapshot: parseProgressSnapshot(event.detail) });
  }

  syncFromStorage();
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener(PROGRESS_CHANGE_EVENT, handleProgressChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener(PROGRESS_CHANGE_EVENT, handleProgressChange);
  };
}
