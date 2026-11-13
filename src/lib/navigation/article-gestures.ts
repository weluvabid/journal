import { notify } from '../notifications.ts';

export interface ArticleSwipeTargets {
  readonly previousUrl: string | null;
  readonly nextUrl: string | null;
  readonly threshold?: number;
}

export type ArticleSwipeDirection = 'previous' | 'next';

export function resolveArticleSwipeDirection(
  deltaX: number,
  deltaY: number,
  threshold = 72,
): ArticleSwipeDirection | null {
  if (!Number.isFinite(threshold) || threshold <= 0) {
    throw new RangeError(`Swipe threshold must be a positive finite number; received ${threshold}`);
  }

  if (Math.abs(deltaX) < threshold || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
    return null;
  }

  return deltaX < 0 ? 'next' : 'previous';
}

export function resolveArticleSwipeDestination(
  deltaX: number,
  deltaY: number,
  targets: ArticleSwipeTargets,
): string | null {
  const direction = resolveArticleSwipeDirection(deltaX, deltaY, targets.threshold);

  if (!direction) {
    return null;
  }

  return direction === 'next' ? targets.nextUrl : targets.previousUrl;
}

const ignoredSwipeTargets = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  'summary',
  'pre',
  'code',
  '[contenteditable="true"]',
  '[data-no-swipe]',
].join(',');

const BOUNDARY_NOTICE_INTERVAL = 1400;

function signalSwipeBoundary(article: HTMLElement, direction: ArticleSwipeDirection): void {
  const message =
    direction === 'next' ? "You've reached the last entry" : "You're at the first entry";
  const now = Date.now();
  const previousNotice = boundaryNoticeTimes.get(direction) ?? 0;

  if (now - previousNotice >= BOUNDARY_NOTICE_INTERVAL) {
    boundaryNoticeTimes.set(direction, now);
    notify('info', message, { duration: 1800 });
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const offset = direction === 'next' ? -4 : 4;

    article.animate(
      [
        { transform: 'translateX(0)' },
        { transform: `translateX(${offset}px)` },
        { transform: 'translateX(0)' },
      ],
      { duration: 180, easing: 'ease-out' },
    );
  }
}

const boundaryNoticeTimes = new Map<ArticleSwipeDirection, number>();

/** Attach touch-only horizontal article navigation and return deterministic cleanup. */
export function attachArticleSwipeNavigation(
  targets: ArticleSwipeTargets,
  navigateTo: (destination: string) => void,
): () => void {
  const root = window;
  let start: { x: number; y: number; pointerId: number; article: HTMLElement } | null = null;

  function onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'touch' || !event.isPrimary || event.button !== 0) {
      return;
    }

    if (event.clientX < 24 || event.clientX > root.innerWidth - 24) {
      return;
    }

    if (!(event.target instanceof Element)) {
      return;
    }

    const article = event.target.closest<HTMLElement>('article[data-article-swipe]');

    if (!article || event.target.closest(ignoredSwipeTargets)) {
      return;
    }

    start = { x: event.clientX, y: event.clientY, pointerId: event.pointerId, article };
  }

  function onPointerUp(event: PointerEvent): void {
    if (!start || event.pointerId !== start.pointerId) {
      return;
    }

    const origin = start;

    start = null;

    if (event.pointerType !== 'touch' || !(event.target instanceof Element)) {
      return;
    }

    if (event.target.closest('article[data-article-swipe]') !== origin.article) {
      return;
    }

    if (event.target.closest(ignoredSwipeTargets) || root.getSelection()?.toString()) {
      return;
    }

    const direction = resolveArticleSwipeDirection(
      event.clientX - origin.x,
      event.clientY - origin.y,
      targets.threshold,
    );

    if (!direction) {
      return;
    }

    const destination = direction === 'next' ? targets.nextUrl : targets.previousUrl;

    if (destination) {
      navigateTo(destination);
    } else {
      signalSwipeBoundary(origin.article, direction);
    }
  }

  function reset(): void {
    start = null;
  }

  root.addEventListener('pointerdown', onPointerDown, { passive: true });
  root.addEventListener('pointerup', onPointerUp, { passive: true });
  root.addEventListener('pointercancel', reset, { passive: true });

  return () => {
    root.removeEventListener('pointerdown', onPointerDown);
    root.removeEventListener('pointerup', onPointerUp);
    root.removeEventListener('pointercancel', reset);
  };
}
