import { z } from 'zod';

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('teamdocs-api'),
  timestamp: z.iso.datetime(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const documentStatusSchema = z.enum(['draft', 'published', 'archived']);
export type DocumentStatus = z.infer<typeof documentStatusSchema>;

export const documentSummarySchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  status: documentStatusSchema,
  updatedAt: z.iso.datetime(),
});

export type DocumentSummary = z.infer<typeof documentSummarySchema>;
