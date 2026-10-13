import { z } from "zod";

export const Insight: z.ZodObject<{
  id: z.ZodNumber;
  brand: z.ZodNumber;
  createdAt: z.ZodDate;
  text: z.ZodString;
}> = z.object({
  id: z.number().int().min(0),
  brand: z.number().int().min(0),
  createdAt: z.coerce.date(),
  text: z.string(),
});

export type Insight = z.infer<typeof Insight>;

export const NewInsight: z.ZodObject<{
  brand: z.ZodNumber;
  text: z.ZodString;
}> = z.object({
  brand: z.number().int().min(0),
  text: z.string().trim().min(1),
});

export type NewInsight = z.infer<typeof NewInsight>;

export const InsightId: z.ZodEffects<z.ZodString, number, string> = z
  .string()
  .regex(/^\d+$/)
  .transform(Number);
