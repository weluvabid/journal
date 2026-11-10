export type NotificationKind = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  description?: string;
  duration?: number;
  id?: string | number;
}

export interface NotificationMessage {
  kind: NotificationKind;
  message: string;
  options?: NotificationOptions;
}

const NOTIFICATION_EVENT = 'frontend-atlas:notification';

/** Dispatch a notification to the application-level toaster Astro island. */
export function notify(
  kind: NotificationKind,
  message: string,
  options?: NotificationOptions,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<NotificationMessage>(NOTIFICATION_EVENT, {
      detail: { kind, message, options },
    }),
  );
}

/** Subscribe the single toaster island to notifications from other Astro islands. */
export function subscribeToNotifications(
  callback: (notification: NotificationMessage) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const listener = (event: Event): void => {
    if (!(event instanceof CustomEvent)) {
      throw new TypeError('Notification event must be a CustomEvent.');
    }

    const detail: unknown = event.detail;

    if (
      typeof detail !== 'object' ||
      detail === null ||
      !('kind' in detail) ||
      !('message' in detail) ||
      typeof detail.kind !== 'string' ||
      !['success', 'error', 'warning', 'info'].includes(detail.kind) ||
      typeof detail.message !== 'string'
    ) {
      throw new TypeError('Received an invalid Frontend Atlas notification event.');
    }

    callback(detail as NotificationMessage);
  };

  window.addEventListener(NOTIFICATION_EVENT, listener);

  return () => window.removeEventListener(NOTIFICATION_EVENT, listener);
}
