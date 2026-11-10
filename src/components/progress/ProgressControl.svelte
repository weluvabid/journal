<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Alert } from '@weluvabid/iris/components';
  import { Check, Circle } from '@weluvabid/iris/lucide';
  import { notify } from '@lib/notifications';
  import { subscribeToProgress, toggleQuestionCompletion } from '@lib/progress/service';
  import type { ProgressReadResult } from '@lib/progress/storage';

  interface Props {
    questionId: string;
  }

  const { questionId }: Props = $props();
  let completed = $state(false);
  let completedIds = $state<string[]>([]);
  let status = $state('');
  let storageAvailable = $state(true);

  function toggleCompleted(): void {
    const result = toggleQuestionCompletion(questionId, completedIds);

    completedIds = [...result.snapshot.completed];
    completed = result.snapshot.completed.includes(questionId);

    if (!result.persisted) {
      storageAvailable = false;
      status = '';
      notify('warning', 'Progress is available in this tab only', {
        description: 'Browser storage is unavailable.',
      });

      return;
    }

    storageAvailable = true;
    status = '';
    notify('success', completed ? 'Question marked complete' : 'Question marked incomplete');
  }

  onMount(() => {
    function handleProgressResult(result: ProgressReadResult): void {
      if (!result.ok) {
        storageAvailable = result.reason !== 'unavailable';
        status = '';

        if (result.reason === 'invalid-data') {
          notify('error', 'Saved progress is invalid', {
            description:
              'Use Manage Progress to import a valid QR image or replace local progress.',
          });
        }

        return;
      }

      storageAvailable = true;
      completedIds = [...result.snapshot.completed];
      completed = result.snapshot.completed.includes(questionId);
    }

    return subscribeToProgress(handleProgressResult);
  });
</script>

<div class="flex flex-wrap items-center gap-3">
  <Button.Root
    variant={completed ? 'secondary' : 'outline'}
    class="rounded-full"
    aria-pressed={completed}
    aria-keyshortcuts="M"
    data-completion-toggle
    onclick={toggleCompleted}
  >
    {#if completed}<Check aria-hidden="true" />{:else}<Circle aria-hidden="true" />{/if}
    {completed ? 'Completed' : 'Mark as complete'}
  </Button.Root>
  {#if !storageAvailable}
    <Alert.Root variant="destructive" class="w-full"
      ><Alert.Description>Progress persistence is unavailable.</Alert.Description></Alert.Root
    >
  {/if}
  {#if status}
    <p class="w-full text-xs text-muted-foreground" role="status">{status}</p>
  {/if}
</div>
