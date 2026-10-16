import type { Database } from "@db/sqlite";
import * as oak from "@oak/oak";
import type { ApiError } from "./http/api-error.ts";
import { log } from "./log.ts";
import { createHealthRouter } from "./routes/health.ts";
import { createInsightsRouter } from "./routes/insights.ts";

export const createApp = (db: Database) => {
  const app = new oak.Application();
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(
        `${ctx.request.method} ${ctx.request.url.pathname} failed: ${message}`,
      );
      ctx.response.status = 500;
      ctx.response.body = {
        message: "Something went wrong",
      } satisfies ApiError;
    }
  });
  app.use(async (ctx, next) => {
    ctx.response.headers.set("X-Content-Type-Options", "nosniff");
    await next();
  });

  for (const router of [createHealthRouter(), createInsightsRouter(db)]) {
    app.use(router.routes());
    app.use(router.allowedMethods());
  }

  return app;
};
