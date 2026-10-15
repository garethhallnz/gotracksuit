import type { Context } from "@oak/oak";
import type { z } from "zod";
import type { ApiError } from "./api-error.ts";

type JsonBody<T> =
  | { isValid: true; data: T }
  | { isValid: false; status: 400 | 415; error: ApiError };

export const readJsonBody = async <S extends z.ZodTypeAny>(
  ctx: Context,
  schema: S,
): Promise<JsonBody<z.infer<S>>> => {
  if (ctx.request.body.type() !== "json") {
    return {
      isValid: false,
      status: 415,
      error: { message: "Request body must be JSON" },
    };
  }

  let body: unknown;
  try {
    body = await ctx.request.body.json();
  } catch {
    return {
      isValid: false,
      status: 400,
      error: { message: "Request body must be valid JSON" },
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const { formErrors, fieldErrors } = result.error.flatten();
    const message = formErrors[0] ?? "Request body is invalid";
    const hasFieldErrors = Object.keys(fieldErrors).length > 0;
    return {
      isValid: false,
      status: 400,
      error: hasFieldErrors ? { message, fieldErrors } : { message },
    };
  }

  return { isValid: true, data: result.data };
};
