import type { Database } from "@db/sqlite";
import * as oak from "@oak/oak";
import { InsightId, NewInsight } from "@suittracker/lib/schemas/insight";
import type { ApiError } from "../http/api-error.ts";
import { readJsonBody } from "../http/read-json-body.ts";
import createInsight from "../operations/create-insight.ts";
import deleteInsight from "../operations/delete-insight.ts";
import listInsights from "../operations/list-insights.ts";
import lookupInsight from "../operations/lookup-insight.ts";

const INVALID_ID: ApiError = {
  message: "Insight id must be a non-negative whole number",
};

const NOT_FOUND: ApiError = { message: "Insight not found" };

export const createInsightsRouter = (db: Database) => {
  const router = new oak.Router();

  router.get("/insights", (ctx) => {
    const result = listInsights({ db });
    ctx.response.body = result;
    ctx.response.status = 200;
  });

  router.get("/insights/:id", (ctx) => {
    const id = InsightId.safeParse(ctx.params.id);
    if (!id.success) {
      ctx.response.body = INVALID_ID;
      ctx.response.status = 400;
      return;
    }

    const result = lookupInsight({ db, id: id.data });
    if (!result) {
      ctx.response.body = NOT_FOUND;
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = result;
    ctx.response.status = 200;
  });

  router.post("/insights", async (ctx) => {
    const input = await readJsonBody(ctx, NewInsight);
    if (!input.isValid) {
      ctx.response.body = input.error;
      ctx.response.status = input.status;
      return;
    }

    const result = createInsight({ db, ...input.data });
    ctx.response.body = result;
    ctx.response.status = 201;
  });

  router.delete("/insights/:id", (ctx) => {
    const id = InsightId.safeParse(ctx.params.id);
    if (!id.success) {
      ctx.response.body = INVALID_ID;
      ctx.response.status = 400;
      return;
    }

    const isDeleted = deleteInsight({ db, id: id.data });
    if (!isDeleted) {
      ctx.response.body = NOT_FOUND;
      ctx.response.status = 404;
      return;
    }

    ctx.response.status = 204;
  });

  return router;
};
