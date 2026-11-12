import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const journal = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/journal' }),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(8).max(120),
    type: z.enum(['engineering-note', 'build-log', 'deep-dive', 'retrospective']),
    category: z.enum([
      'systems-engineering',
      'frontend-engineering',
      'product-engineering',
      'engineering-thinking',
    ]),
    summary: z.string().min(30).max(240),
    date: z.coerce.date(),
    project: z.string().optional(),
    tags: z.array(z.string().min(2)).min(1).max(8),
    searchTerms: z.array(z.string().min(2).max(80)).max(12).default([]),
    links: z
      .object({
        git: z.url().optional(),
        stackblitz: z.url().optional(),
        mermaid: z.url().optional(),
      })
      .optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(3).max(100),
    summary: z.string().min(30).max(240),
    status: z.enum(['active', 'released', 'experimental']),
    stack: z.array(z.string().min(1)).min(1).max(12),
    tags: z.array(z.string().min(2)).max(12).default([]),
    github: z.url().optional(),
    demo: z.url().optional(),
    stackblitz: z.url().optional(),
    mermaid: z.url().optional(),
    featured: z.boolean().default(false),
    order: z.number().int().nonnegative(),
  }),
});

export const collections = { journal, projects };
