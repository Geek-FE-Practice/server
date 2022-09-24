import "module-alias/register";
import Koa from "koa";

import { client } from "./db";
import middleware from "./middlewares";
import route from "./routes";
import "./schedule/index";

client.connect().then(() => {
  const app = new Koa();
  middleware(app);
  route(app);

  app.listen(8000, () => {
    console.log("server on 8000");
  });
});
