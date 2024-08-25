import { Router } from "express";
const router = Router({ caseSensitive: true, strict: true });
import accessRateLimiter from "../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../middlewares/checkAccessKey";
import checkAuth from "../../../middlewares/checkAuth";
import controller from "./homeController";

router.post(
  `/dashboard-detail`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  controller.dashboardDetail
);

export default router;
