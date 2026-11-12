export interface JournalCategory {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

export const categories = [
  {
    id: 'systems-engineering',
    name: 'Rust & Systems',
    description: 'Experiments in systems programming, storage, concurrency and performance.',
  },
  {
    id: 'frontend-engineering',
    name: 'Frontend Engineering',
    description: 'Browser mechanics, interface architecture, accessibility and interaction design.',
  },
  {
    id: 'product-engineering',
    name: 'Product Engineering',
    description:
      'Building useful tools, shaping product decisions and turning ideas into working software.',
  },
  {
    id: 'engineering-thinking',
    name: 'Engineering Thinking',
    description:
      'Mathematical reasoning, problem decomposition, trade-offs and the craft of solving problems.',
  },
] as const satisfies readonly JournalCategory[];

export const categoryById = new Map(categories.map((category) => [category.id, category]));
