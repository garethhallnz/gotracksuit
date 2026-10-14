import type { Database } from "@db/sqlite";
import * as oak from "@oak/oak";
import { InsightId, NewInsight } from "@suittracker/lib/schemas/insight";
import createInsight from "./operations/create-insight.ts";
import deleteInsight from "./operations/delete-insight.ts";
import listInsights from "./operations/list-insights.ts";
import lookupInsight from "./operations/lookup-insight.ts";

export const createApp = (db: Database) => {
  const router = new oak.Router();

  router.get("/_health", (ctx) => {
    ctx.response.body = "OK";
    ctx.response.status = 200;
  });

  router.get("/insights", (ctx) => {
    const result = listInsights({ db });
    ctx.response.body = result;
    ctx.response.status = 200;
  });

  router.get("/insights/:id", (ctx) => {
    const id = InsightId.safeParse(ctx.params.id);
    if (!id.success) {
      ctx.response.status = 400;
      return;
    }

    const result = lookupInsight({ db, id: id.data });
    if (!result) {
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = result;
    ctx.response.status = 200;
  });

  router.post("/insights", async (ctx) => {
    if (ctx.request.body.type() !== "json") {
      ctx.response.status = 415;
      return;
    }

    const input = NewInsight.safeParse(await ctx.request.body.json());
    if (!input.success) {
      ctx.response.body = input.error.flatten();
      ctx.response.status = 400;
      return;
    }

    const result = createInsight({ db, ...input.data });
    ctx.response.body = result;
    ctx.response.status = 201;
  });

  router.delete("/insights/:id", (ctx) => {
    const id = InsightId.safeParse(ctx.params.id);
    if (!id.success) {
      ctx.response.status = 400;
      return;
    }

    const isDeleted = deleteInsight({ db, id: id.data });
    ctx.response.status = isDeleted ? 204 : 404;
  });

  const app = new oak.Application();
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
};
