export interface HorizontalScrollState {
  readonly canScrollLeft: boolean;
  readonly canScrollRight: boolean;
}

export interface HorizontalScrollOptions {
  readonly revealSelector?: string;
}

export function getHorizontalScrollState(
  element: Pick<HTMLElement, 'scrollWidth' | 'clientWidth' | 'scrollLeft'>,
): HorizontalScrollState {
  const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth);
  return {
    canScrollLeft: maxScrollLeft > 1 && element.scrollLeft > 1,
    canScrollRight: maxScrollLeft > 1 && element.scrollLeft < maxScrollLeft - 1,
  };
}

/** Attach scroll/resize observation and optionally reveal the current item. */
export function observeHorizontalScroll(
  viewport: HTMLElement,
  track: HTMLElement,
  onChange: (state: HorizontalScrollState) => void,
  options: HorizontalScrollOptions = {},
): () => void {
  const update = () => onChange(getHorizontalScrollState(viewport));
  const reveal = () => {
    if (options.revealSelector) {
      const active = viewport.querySelector<HTMLElement>(options.revealSelector);
      if (active) {
        const viewportRect = viewport.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        const fullyVisible =
          activeRect.left >= viewportRect.left && activeRect.right <= viewportRect.right;
        if (!fullyVisible) {
          const desired =
            viewport.scrollLeft +
            activeRect.left -
            viewportRect.left -
            (viewport.clientWidth - activeRect.width) / 2;
          const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
          viewport.scrollLeft = Math.max(0, Math.min(desired, maxScrollLeft));
        }
      }
    }
    update();
  };

  viewport.addEventListener('scroll', update, { passive: true });
  let resizeObserver: ResizeObserver | undefined;
  let fallbackResize: (() => void) | undefined;

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(reveal);
    resizeObserver.observe(viewport);
    resizeObserver.observe(track);
  } else {
    fallbackResize = reveal;
    window.addEventListener('resize', fallbackResize);
  }
  reveal();

  return () => {
    viewport.removeEventListener('scroll', update);
    resizeObserver?.disconnect();
    if (fallbackResize) window.removeEventListener('resize', fallbackResize);
  };
}
