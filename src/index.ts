import "module-alias/register";
import Koa from "koa";
import dotenv from "dotenv";

import middleware from "./middlewares";
import route from "./routes";
import DB from "./db";

dotenv.config();

new DB().connectDB(() => {
  const app = new Koa();
  middleware(app);
  route(app);

  app.listen(8000, () => {
    console.log("server on 8000");
  });
});
