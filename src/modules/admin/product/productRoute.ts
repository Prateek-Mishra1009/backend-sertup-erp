import { Router } from "express";
const router = Router({ caseSensitive: true, strict: false });
import accessRateLimiter from "../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../middlewares/checkAccessKey";
import checkAuth from "../../../middlewares/checkAuth";
import validation from "./productValidation";
import controller from "./productController";

  router.post(
    `/add-product`,
    accessRateLimiter,
    checkAccessKey,
    checkAuth.Manager,
    validation.addProduct,
    controller.addProduct
  );


  router.post(
    `/create-product`,
    accessRateLimiter,
    checkAccessKey,
    checkAuth.Manager,
    validation.createProduct,
    controller.createProduct
  );

router.post(
  `/product-list`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.productList,
  controller.productList
);


router.post(
  `/product-detail/:product_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.productDetail,
  controller.productDetail
);


router.post(
  `/update-basicDetail/:product_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.updateBasicDetails,
  controller.updateBasicDetails
);

router.post(
  `/update-otherDetail/:product_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.updateOtherDetails,
  controller.updateOtherDetails
);

router.post(
  `/update-priceDetail/:product_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.updatePriceDetails,
  controller.updatePriceDetails
);


router.post(
  `/update-paintFormula/:product_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.updatePaintFormula,
  controller.updatePaintFormula
);

router.delete(
  `/delete-product`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.deleteProduct,
  controller.deleteProduct
);
export default router;

