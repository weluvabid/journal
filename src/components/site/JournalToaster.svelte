<script lang="ts">
  import { onMount } from 'svelte';
  import { Sonner } from '@weluvabid/iris/components';
  import { subscribeToNotifications } from '@lib/notifications';

  let theme = $state<'light' | 'dark'>('light');

  onMount(() => {
    const syncTheme = (): void => {
      theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    };

    syncTheme();

    const themeObserver = new MutationObserver(syncTheme);

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const dismissForNavigation = (): void => {
      Sonner.toast.dismiss();
    };

    document.addEventListener('astro:before-preparation', dismissForNavigation);

    const unsubscribe = subscribeToNotifications(({ kind, message, options }) => {
      switch (kind) {
        case 'success':
          Sonner.toast.success(message, options);
          break;
        case 'error':
          Sonner.toast.error(message, options);
          break;
        case 'warning':
          Sonner.toast.warning(message, options);
          break;
        case 'info':
          Sonner.toast.info(message, options);
          break;
        default: {
          const exhaustive: never = kind;

          throw new Error(`Unsupported notification kind: ${String(exhaustive)}`);
        }
      }
    });

    return () => {
      themeObserver.disconnect();
      document.removeEventListener('astro:before-preparation', dismissForNavigation);
      unsubscribe();
    };
  });
</script>

<Sonner.Toaster {theme} position="bottom-right" closeButton />
