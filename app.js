import DotENV from "dotenv";
import Koa from "koa";
import KoaRouter from "koa-router";
import koaBodyparser from "koa-bodyparser";

DotENV.config();

const app = new Koa();
const router = new KoaRouter();

app.use(koaBodyparser());

router.get('/', function (context) {
  context.status = 200;
  context.body = "Pong";
});

app.use(router.routes());
const server = app.listen(process.env.PORT || 3000, () => {
  console.log("listening on port " + (process.env.PORT || 3000));
});
