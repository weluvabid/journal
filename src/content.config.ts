import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const questions = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/questions' }),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(12).max(120),
    domain: z.enum([
      'javascript-typescript',
      'browser-web-platform',
      'css-rendering',
      'frameworks-ui-architecture',
      'ui-engineering',
      'performance-reliability',
      'frontend-system-design',
      'accessibility-security-testing',
    ]),
    summary: z.string().min(40).max(240),
    difficulty: z.enum(['foundation', 'intermediate', 'advanced']),
    minutes: z.number().int().min(3).max(45),
    tags: z.array(z.string().min(2)).min(1).max(8),
    searchTerms: z.array(z.string().min(2).max(80)).max(12).default([]),
    prerequisites: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

export const collections = { questions };
