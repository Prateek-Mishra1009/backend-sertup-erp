import { Router } from "express";
const router = Router({ caseSensitive: true, strict: false });
import accessRateLimiter from "../../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../../middlewares/checkAccessKey";
import checkAuth from "../../../../middlewares/checkAuth";
import controller from "./purchaseOrderController";
import validation from "./purchaseOrderValidation"
import { handleSignatureUpload } from "../../../../middlewares/multer";


router.post(
  `/create-purchase-order`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  handleSignatureUpload,
  // validation.createOrUpdateOrder,
  controller.createPurchaseOrder
);
router.post(
  `/create-purchase-order-from-alerts`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.createOrUpdateOrder,
  controller.createOrderFromMessages
);

router.post(
  `/create-purchase-return-order`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.updateStatusOfPurchaseOrder,
  controller.createPurchaseReturn
);

router.post(
  `/update-purchase-order`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.createOrUpdateOrder,
  controller.updatePurchaseOrder
);

router.post(
  `/generate-purhase-order-invoice`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.generatePurchaseOrderInvoice,
  controller.generatePurchaseOrderInvoice
);

router.post(
  `/update-purchase-order-status`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  // validation.updateStatusOfPurchaseOrder,
  controller.updateStatusOfPurchaseOrder
);

router.post(
  `/get-purchase-order-details`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.updateStatusOfPurchaseOrder,
  controller.getPurchaseOrder
);

export default router;

