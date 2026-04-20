import { z } from "zod";

export const createUpdateSchema = z.object({
  title: z.string().min(2).max(160),
  body: z.string().min(2).max(5000),
  progress_percent: z.coerce.number().int().min(0).max(100),
  created_at: z.string().optional(),
});
