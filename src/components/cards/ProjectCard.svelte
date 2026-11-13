<script lang="ts">
  import { Badge } from '@weluvabid/iris/components';
  import ContentCard from './ContentCard.svelte';
  import TagList from './TagList.svelte';

  interface Project {
    readonly id: string;
    readonly title: string;
    readonly summary: string;
    readonly status: string;
    readonly order: number;
    readonly tags: readonly string[];
  }

  interface Props {
    project: Project;
    href: string;
    number?: number;
    class?: string;
  }

  let { project, href, number = project.order, class: className = '' }: Props = $props();
</script>

<ContentCard {href} label={`View project ${project.title}`} class={className}>
  <div class="flex h-full min-w-0 flex-col gap-3 p-5">
    <div class="flex items-center gap-2">
      <span class="text-xs tabular-nums text-muted-foreground"
        >{String(number).padStart(2, '0')}</span
      >
      <Badge.Badge variant="outline" class="capitalize">{project.status}</Badge.Badge>
    </div>
    <div class="min-w-0">
      <h2 class="font-medium tracking-tight">{project.title}</h2>
      <p class="mt-2 text-sm leading-6 text-muted-foreground">{project.summary}</p>
    </div>
    <div class="mt-auto block w-full min-w-0 max-w-full pt-1">
      <TagList tags={project.tags} label={project.title} collection="projects" />
    </div>
  </div>
</ContentCard>
