type AstroSwapEvent = Event & { newDocument: Document };
type AstroPreparationEvent = Event & { loader: () => Promise<void> };

declare global {
  interface Window {
    __journalRouterLifecycleInstalled?: boolean;
  }
}

function preventDuplicateInternalNavigation(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0) {
    return;
  }

  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  const link = target.closest('a[href]');

  if (!(link instanceof HTMLAnchorElement)) {
    return;
  }

  if (
    link.hasAttribute('download') ||
    link.hasAttribute('data-astro-reload') ||
    (link.target && link.target !== '_self') ||
    link.relList.contains('external')
  ) {
    return;
  }

  const destination = new URL(link.href, window.location.href);
  const current = new URL(window.location.href);

  if (
    destination.origin === current.origin &&
    destination.pathname === current.pathname &&
    destination.search === current.search &&
    destination.hash === current.hash &&
    !destination.hash
  ) {
    event.preventDefault();
  }
}

function preserveTheme(event: AstroSwapEvent): void {
  const isDark = document.documentElement.classList.contains('dark');

  event.newDocument.documentElement.classList.toggle('dark', isDark);
}

function hideNavigationLoader(loader: HTMLElement | null): void {
  if (!loader) {
    return;
  }

  delete loader.dataset.visible;
  loader.setAttribute('aria-hidden', 'true');
}

function withNavigationLoader(event: AstroPreparationEvent): void {
  const originalLoader = event.loader;

  event.loader = async () => {
    const loader = document.getElementById('journal-navigation-loader');
    const revealTimer = window.setTimeout(() => {
      if (!loader) {
        return;
      }

      loader.dataset.visible = 'true';

      loader.setAttribute('aria-hidden', 'false');
    }, 200);

    try {
      await originalLoader();
    } finally {
      window.clearTimeout(revealTimer);
      hideNavigationLoader(loader);
    }
  };
}

export function installRouterLifecycle(documentRef: Document = document): () => void {
  if (window.__journalRouterLifecycleInstalled) {
    return () => {};
  }

  window.__journalRouterLifecycleInstalled = true;

  const handleClick = (event: Event) => {
    if (event instanceof MouseEvent) {
      preventDuplicateInternalNavigation(event);
    }
  };
  const handleBeforeSwap = (event: Event) => preserveTheme(event as AstroSwapEvent);
  const handleBeforePreparation = (event: Event) =>
    withNavigationLoader(event as AstroPreparationEvent);
  const handlePageLoad = () =>
    hideNavigationLoader(documentRef.getElementById('journal-navigation-loader'));

  documentRef.addEventListener('click', handleClick, true);
  documentRef.addEventListener('astro:before-swap', handleBeforeSwap);
  documentRef.addEventListener('astro:before-preparation', handleBeforePreparation);
  documentRef.addEventListener('astro:page-load', handlePageLoad);

  return () => {
    documentRef.removeEventListener('click', handleClick, true);
    documentRef.removeEventListener('astro:before-swap', handleBeforeSwap);
    documentRef.removeEventListener('astro:before-preparation', handleBeforePreparation);
    documentRef.removeEventListener('astro:page-load', handlePageLoad);

    window.__journalRouterLifecycleInstalled = false;
  };
}
