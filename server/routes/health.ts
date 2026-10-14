import * as oak from "@oak/oak";

export const createHealthRouter = () => {
  const router = new oak.Router();

  router.get("/_health", (ctx) => {
    ctx.response.body = "OK";
    ctx.response.status = 200;
  });

  return router;
};
