import { Router } from "express";
const router = Router({ caseSensitive: true, strict: false });
import accessRateLimiter from "../../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../../middlewares/checkAccessKey";
import checkAuth from "../../../../middlewares/checkAuth";
import controller from "./salesController";
import validation from "./salesValidation";
import { handleSignatureUpload } from "../../../../middlewares/multer";

  router.post(
    `/create-order`,
    accessRateLimiter,
    handleSignatureUpload,
    // checkAccessKey,
    // checkAuth.Manager,
    // validation.addProduct,
    controller.createSalesOrder
  );


router.post(`/return-order`,
  accessRateLimiter,
  // checkauth.manager,
  validation.salesReturn,
  controller.salesReturn
)

export default router

  