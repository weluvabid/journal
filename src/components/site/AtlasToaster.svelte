<script lang="ts">
  import { onMount } from 'svelte';
  import { Sonner } from '@weluvabid/iris/components';
  import { subscribeToNotifications } from '@lib/notifications';

  onMount(() =>
    subscribeToNotifications(({ kind, message, options }) => {
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
    }),
  );
</script>

<Sonner.Toaster position="bottom-right" closeButton />
