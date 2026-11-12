<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props {
    href: string;
    class?: string;
    children: Snippet;
    label?: string;
  }
  let { href, class: className = '', children, label }: Props = $props();
</script>

<article
  class={`group relative rounded-2xl border border-border transition-colors hover:ring-1 hover:ring-ring/50 ${className}`}
>
  <a
    {href}
    aria-label={label}
    data-card-navigation
    class="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
  ></a>
  <div class="relative z-10 pointer-events-none">{@render children()}</div>
</article>
