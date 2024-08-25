import { Router } from "express";
const router = Router({ caseSensitive: true, strict: false });
import accessRateLimiter from "../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../middlewares/checkAccessKey";
import checkAuth from "../../../middlewares/checkAuth";
import validation from "./settingValidation";
import controller from "./settingController";

router.post(
  `/get-detail`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  controller.getDetail
);

router.put(
  `/manage-webMaintenance`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.manageMaintenance,
  controller.manageWebMaintenance
);

router.put(
  `/manage-appMaintenance`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.manageMaintenance,
  controller.manageAppMaintenance
);

router.put(
  `/manage-inventoryMaintenance`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.manageMaintenance,
  controller.manageInventoryMaintenance
);

router.put(
  `/manage-inventoryAppMaintenance`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.manageMaintenance,
  controller.manageInventoryAppMaintenance
);

router.put(
  `/manage-supportMaintenance`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.manageMaintenance,
  controller.manageSupportMaintenance
);

export default router;
