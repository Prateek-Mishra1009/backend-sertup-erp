import { Router } from "express";
const router = Router({ caseSensitive: true, strict: false });
import accessRateLimiter from "../../middlewares/accessRateLimiter";
import checkAccessKey from "../../middlewares/checkAccessKey";
import checkAuth from "../../middlewares/checkAuth";
import validation from "./inventoryValidation";
import controller from "./inventoryController";
 
router.post(
  `/inventory-list`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.inventoryList,
  controller.inventoryList
);
 
router.post(
  `/inventory-detail/:product_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.detail,
  controller.detail
);
 
router.put(
  `/manage-inventory`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Admin,
  // validation.manageInventory,
  controller.manageInventory
);
 
router.post(
  `/inventory-history-list`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.inventoryHistorylist,
  controller.inventoryHistorylist
);

export default router;
