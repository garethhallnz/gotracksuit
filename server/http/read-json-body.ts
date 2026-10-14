import type { Context } from "@oak/oak";
import type { z } from "zod";

type ValidationError = {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
};

type JsonBody<T> =
  | { isValid: true; data: T }
  | { isValid: false; status: 400 | 415; error?: ValidationError };

export const readJsonBody = async <S extends z.ZodTypeAny>(
  ctx: Context,
  schema: S,
): Promise<JsonBody<z.infer<S>>> => {
  if (ctx.request.body.type() !== "json") {
    return { isValid: false, status: 415 };
  }

  let body: unknown;
  try {
    body = await ctx.request.body.json();
  } catch {
    return {
      isValid: false,
      status: 400,
      error: { formErrors: ["Body must be valid JSON"], fieldErrors: {} },
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return { isValid: false, status: 400, error: result.error.flatten() };
  }

  return { isValid: true, data: result.data };
};
