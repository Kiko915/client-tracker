import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  client_name: z.string().min(2).max(120),
  status: z.enum(["planning", "in_progress", "on_hold", "done"])
});

export const updateProjectSchema = createProjectSchema;
