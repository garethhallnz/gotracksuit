import { z } from "zod";

export const Insight = z.object({
  id: z.number().int().min(0),
  brand: z.number().int().min(0),
  createdAt: z.date(),
  text: z.string(),
});

export type Insight = z.infer<typeof Insight>;

export const NewInsight = z.object({
  brand: z.number().int().min(0),
  text: z.string().min(1),
});

export type NewInsight = z.infer<typeof NewInsight>;

export const InsightId = z.string().regex(/^\d+$/).transform(Number);
