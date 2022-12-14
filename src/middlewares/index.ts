import type { App } from "./types";
import bodyParser from "koa-bodyparser";

import logger from "./logger";
import jsonError from "./jsonError";

/**
 * 注册 middleware
 * @param app
 */
export default function middleware(app: App): void {
  app.use(
    bodyParser({
      extendTypes: {
        json: ["application/json", "text/plain"],
      },
    })
  );
  logger(app);
  jsonError(app);
}
