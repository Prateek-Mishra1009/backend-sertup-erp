import { Router } from "express";
const router = Router({ caseSensitive: true, strict: false });
import accessRateLimiter from "../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../middlewares/checkAccessKey";
import checkAuth from "../../../middlewares/checkAuth";
import stockMovementValidation from "./stockMovementValidation";
import controller from "./stockMovementController"
 
router.post(
  `/stock-detail`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  stockMovementValidation.selectStock,
  controller.selectStock
);

// router.post(
//   `/stock-transfer`,
//   accessRateLimiter,
//   checkAccessKey,
//   checkAuth.Manager,
//   stockMovementValidation.stockTransfer,
//   controller.stockTransfer
// );

router.post(
  `/stock-history`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  stockMovementValidation.stockHistory,
  controller.stockHistory
);

router.post(
  `/stock-transffer-detail/:transffer_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  stockMovementValidation.stockTransferDetail,
  controller.stockTransferDetail
);

router.get(
  `/download-stockHistory`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  // stockMovementValidation.downloadStockHistoryExcel,
  controller.downloadStockHistoryExcel
);

export default router;
