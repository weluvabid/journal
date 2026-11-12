<script lang="ts">
  import { Select } from '@weluvabid/iris/components';

  interface CategoryOption { readonly id: string; readonly name: string; }
  let { categories, current = 'all', base = '/' }: { categories: readonly CategoryOption[]; current?: string; base?: string } = $props();

  function navigate(value: string): void {
    const prefix = `/${base.replace(/^\/+|\/+$/gu, '')}`.replace(/^\/$/u, '');
    const destination = value === 'all' ? `${prefix}/journal/` : `${prefix}/journal/category/${value}/`;
    window.location.assign(destination);
  }
</script>

<Select.Root type="single" value={current} onValueChange={(value) => value && navigate(value)}>
  <Select.Trigger class="w-full sm:w-64" aria-label="Filter journal entries by category">
    <Select.Value placeholder="Browse all entries" />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="all">All entries</Select.Item>
    {#each categories as category (category.id)}
      <Select.Item value={category.id}>{category.name}</Select.Item>
    {/each}
  </Select.Content>
</Select.Root>
