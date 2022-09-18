import Router from "@koa/router";
import dataController from "@controllers/data";

const router = new Router({
  prefix: "/data",
});

router.post("/spm", dataController.saveSpm);
router.post("/pv", dataController.savePv);

export default router;
