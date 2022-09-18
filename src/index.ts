import Koa from "koa";
import dotenv from "dotenv";

import { client } from "./db";
import middleware from "./middlewares";
import route from "./routes";

dotenv.config();

client.connect().then(() => {
  const app = new Koa();
  middleware(app);
  route(app);

  app.listen(8000, () => {
    console.log("server on 8000");
  });
});
