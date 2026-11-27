import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const journal = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/journal' }),
  schema: z
    .object({
      id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      title: z.string().min(1).max(120),
      type: z.enum(['engineering-note', 'build-log', 'deep-dive', 'retrospective']),
      kind: z.enum(['article', 'project']).default('article'),
      category: z.enum([
        'systems-engineering',
        'frontend-engineering',
        'product-engineering',
        'engineering-thinking',
      ]),
      summary: z.string().min(30).max(240),
      date: z.coerce.date(),
      project: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .optional(),
      relatedProjects: z
        .array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
        .min(1)
        .optional(),
      projectDetails: z
        .object({
          name: z.string().min(1).max(80),
          summary: z.string().min(30).max(240),
          status: z.enum(['active', 'released', 'experimental']),
          stack: z.array(z.string().min(1)).min(1).max(12),
          github: z.url().optional(),
          demo: z.url().optional(),
          stackblitz: z.url().optional(),
          mermaid: z.url().optional(),
          resources: z
            .array(z.object({ label: z.string().min(1), url: z.url().optional() }))
            .default([]),
          order: z.number().int().positive(),
        })
        .optional(),
      series: z
        .object({
          id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
          part: z.number().int().positive(),
        })
        .optional(),
      tags: z.array(z.string().min(2)).min(1).max(12),
      searchTerms: z.array(z.string().min(2).max(80)).max(12).default([]),
      links: z
        .object({
          git: z.url().optional(),
          demo: z.url().optional(),
          stackblitz: z.url().optional(),
          mermaid: z.url().optional(),
        })
        .optional(),
      draft: z.boolean().default(false),
    })
    .superRefine((data, context) => {
      if (data.kind === 'article' && data.title.length < 8) {
        context.addIssue({
          code: 'custom',
          message: 'Article titles must contain at least 8 characters.',
        });
      }

      if (data.kind === 'project' && data.relatedProjects) {
        context.addIssue({
          code: 'custom',
          message: 'Canonical project entries cannot define relatedProjects.',
        });
      }

      if (data.kind === 'project' && (!data.project || !data.projectDetails)) {
        context.addIssue({
          code: 'custom',
          message: 'Project entries require project id and projectDetails.',
        });
      }

      if (data.kind === 'project' && !data.tags.includes('project')) {
        context.addIssue({
          code: 'custom',
          message: 'Canonical project entries must include the project tag.',
        });
      }

      if (data.kind === 'article' && data.projectDetails) {
        context.addIssue({
          code: 'custom',
          message: 'Only canonical project entries may define projectDetails.',
        });
      }
    }),
});

export const collections = { journal };
