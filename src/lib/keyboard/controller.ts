import { appendNavigationDigit, resolveNavigationIndex } from './card-navigation.ts';

export interface KeyboardControllerCallbacks {
  readonly onSearch: () => void;
  readonly onHelp: () => void;
}

const promptEventName = 'atlas:card-navigation-prompt';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]') !== null
  );
}

function hasBlockingOverlay(): boolean {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[role="dialog"], [role="menu"], [role="listbox"]'),
  ).some((overlay) => {
    if (overlay.hidden || overlay.getAttribute('aria-hidden') === 'true') {
      return false;
    }

    const style = window.getComputedStyle(overlay);

    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      overlay.getClientRects().length > 0
    );
  });
}

function visibleCardLinks(collection: HTMLElement): HTMLAnchorElement[] {
  return Array.from(
    collection.querySelectorAll<HTMLAnchorElement>('a[data-card-navigation]'),
  ).filter((link) => {
    if (link.hidden || link.getAttribute('aria-hidden') === 'true') {
      return false;
    }

    if (link.closest('[hidden], [aria-hidden="true"]')) {
      return false;
    }

    const style = window.getComputedStyle(link);

    return (
      style.display !== 'none' && style.visibility !== 'hidden' && link.getClientRects().length > 0
    );
  });
}

function publishNavigationPrompt(active: boolean, value = '', message = ''): void {
  window.dispatchEvent(new CustomEvent(promptEventName, { detail: { active, value, message } }));
}

/** Install the global shortcut controller. Call only from a browser lifecycle hook. */
export function installKeyboardController(callbacks: KeyboardControllerCallbacks): () => void {
  let navigationSequence = '';
  let navigationMode = false;
  let navigationTimer: number | undefined;
  let navigationCollection: HTMLElement | null = null;

  function clearNavigationSequence(message = ''): void {
    if (navigationTimer !== undefined) {
      window.clearTimeout(navigationTimer);
    }

    navigationTimer = undefined;
    navigationSequence = '';
    navigationMode = false;
    navigationCollection = null;
    publishNavigationPrompt(false, '', message);
  }

  function armNavigationTimeout(): void {
    if (navigationTimer !== undefined) {
      window.clearTimeout(navigationTimer);
    }

    navigationTimer = window.setTimeout(() => clearNavigationSequence(), 2000);
  }

  function navigateToNumberedCard(value: string, preferredCollection: HTMLElement | null): void {
    const collection = preferredCollection?.isConnected
      ? preferredCollection
      : document.querySelector<HTMLElement>('[data-keyboard-navigation="primary"]');

    if (!collection) {
      clearNavigationSequence('There are no numbered cards on this page.');

      return;
    }

    const links = visibleCardLinks(collection);
    const index = resolveNavigationIndex(value, links.length);

    if (index === null) {
      clearNavigationSequence(`No visible card numbered ${value} in this list.`);

      return;
    }

    links[index]?.click();
  }

  function activateShortcutTarget(selector: string): boolean {
    const target = document.querySelector<HTMLElement>(selector);

    if (!target) {
      return false;
    }

    target.click();

    return true;
  }

  function handleShortcut(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.isComposing) {
      return;
    }

    const key = event.key;
    const hasModifier = event.metaKey || event.ctrlKey || event.altKey;

    if (hasModifier && key.toLowerCase() === 'k') {
      event.preventDefault();
      clearNavigationSequence();
      callbacks.onSearch();

      return;
    }

    if (hasBlockingOverlay()) {
      return;
    }

    if (navigationMode) {
      if (/^\d$/u.test(key) && !hasModifier && !event.shiftKey) {
        event.preventDefault();
        navigationSequence = appendNavigationDigit(navigationSequence, key);
        publishNavigationPrompt(true, navigationSequence);
        armNavigationTimeout();

        return;
      }

      if (key === 'Enter' && !hasModifier) {
        event.preventDefault();
        const value = navigationSequence;
        const collection = navigationCollection;

        clearNavigationSequence();

        if (value) {
          navigateToNumberedCard(value, collection);
        }

        return;
      }

      if (key === 'Backspace' && !hasModifier) {
        event.preventDefault();
        navigationSequence = navigationSequence.slice(0, -1);
        publishNavigationPrompt(true, navigationSequence);
        armNavigationTimeout();

        return;
      }

      if (key === 'Escape') {
        event.preventDefault();
        clearNavigationSequence();

        return;
      }

      clearNavigationSequence();

      return;
    }

    if (
      key === '?' &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !isEditableTarget(event.target)
    ) {
      event.preventDefault();
      clearNavigationSequence();
      callbacks.onHelp();

      return;
    }

    if (isEditableTarget(event.target) || hasModifier || event.shiftKey) {
      return;
    }

    switch (key.toLowerCase()) {
      case 'g': {
        event.preventDefault();
        navigationSequence = '';
        navigationMode = true;
        const active = document.activeElement;

        navigationCollection =
          active instanceof Element
            ? active.closest<HTMLElement>('[data-keyboard-navigation]')
            : null;
        publishNavigationPrompt(true, '');
        armNavigationTimeout();
        break;
      }
      case '[':
        if (activateShortcutTarget('a[data-article-previous]')) {
          event.preventDefault();
        }

        break;
      case ']':
        if (activateShortcutTarget('a[data-article-next]')) {
          event.preventDefault();
        }

        break;
      case 'm':
        if (activateShortcutTarget('[data-completion-toggle]')) {
          event.preventDefault();
        }

        break;
      case 'p':
        if (activateShortcutTarget('[data-progress-menu-trigger]')) {
          event.preventDefault();
        }

        break;
    }
  }

  window.addEventListener('keydown', handleShortcut, true);

  return () => {
    window.removeEventListener('keydown', handleShortcut, true);

    if (navigationTimer !== undefined) {
      window.clearTimeout(navigationTimer);
    }
  };
}
