<script lang="ts">
  import { onMount } from 'svelte';
  import { subscribeToProgress } from '@lib/progress/service';
  import type { ProgressReadResult } from '@lib/progress/storage';

  function updateIndicators(result: ProgressReadResult): void {
    const questionIndicators = document.querySelectorAll<HTMLElement>('[data-question-progress]');
    const domainIndicators = document.querySelectorAll<HTMLElement>('[data-domain-progress]');

    for (const indicator of questionIndicators) {
      indicator.textContent = '';
      indicator.removeAttribute('data-progress-loading');
      indicator.removeAttribute('aria-hidden');
      indicator.style.display = '';
      indicator.style.visibility = 'hidden';
      indicator.removeAttribute('data-progress-state');
      indicator.className = `${indicator.hasAttribute('data-featured-progress') ? 'mt-auto' : 'mt-3'} inline-flex min-h-6 w-fit items-center rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground`;
    }

    for (const indicator of domainIndicators) {
      indicator.textContent = '';
      indicator.removeAttribute('data-progress-loading');
      indicator.removeAttribute('aria-hidden');
      indicator.style.display = '';
      indicator.style.visibility = 'hidden';
    }

    if (!result.ok) {
      return;
    }

    const { completed, readingProgress } = result.snapshot;
    const completedIds = new Set(completed);

    for (const indicator of questionIndicators) {
      const questionId = indicator.dataset.questionProgress;

      if (!questionId) {
        throw new Error('Question progress indicator is missing its question ID');
      }

      if (completedIds.has(questionId)) {
        indicator.textContent = 'Completed';
        indicator.style.visibility = 'visible';
        indicator.dataset.progressState = 'completed';
        indicator.className = `${indicator.hasAttribute('data-featured-progress') ? 'mt-auto' : 'mt-3'} inline-flex w-fit self-start rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground`;
        indicator.style.display = '';
      } else {
        const reading = readingProgress[questionId];
        const position = reading?.position ?? 0;

        if (position === 65535) {
          indicator.textContent = 'Reached End';
          indicator.dataset.progressState = 'reached-end';
        } else if (position > 0) {
          const percentage = Math.round((position / 65535) * 100);

          indicator.textContent = `In progress · ${percentage}%`;
          indicator.dataset.progressState = 'in-progress';
        } else {
          indicator.textContent = 'Not yet started';
          indicator.dataset.progressState = 'not-started';
        }

        indicator.style.visibility = 'visible';
        indicator.className = `${indicator.hasAttribute('data-featured-progress') ? 'mt-auto' : 'mt-3'} inline-flex w-fit self-start rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground`;
        indicator.style.display = '';
      }
    }

    for (const indicator of domainIndicators) {
      const rawIds = indicator.dataset.questionIds;

      if (!rawIds) {
        throw new Error('Domain progress indicator is missing its question IDs');
      }

      const ids = rawIds.split(',').filter(Boolean);
      const done = ids.filter((id) => completedIds.has(id)).length;
      const reachedEnd = ids.filter(
        (id) => !completedIds.has(id) && readingProgress[id]?.position === 65535,
      ).length;
      const inProgress = ids.filter(
        (id) =>
          !completedIds.has(id) &&
          readingProgress[id] &&
          readingProgress[id].position > 0 &&
          readingProgress[id].position < 65535,
      ).length;

      indicator.textContent = `${done}/${ids.length} completed${reachedEnd ? ` · ${reachedEnd} reached end` : ''}${inProgress ? ` · ${inProgress} in progress` : ''}`;
      indicator.style.visibility = 'visible';
    }
  }

  onMount(() => subscribeToProgress(updateIndicators));
</script>
