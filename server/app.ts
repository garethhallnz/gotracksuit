import type { Database } from "@db/sqlite";
import * as oak from "@oak/oak";
import { createHealthRouter } from "./routes/health.ts";
import { createInsightsRouter } from "./routes/insights.ts";

export const createApp = (db: Database) => {
  const app = new oak.Application();
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
