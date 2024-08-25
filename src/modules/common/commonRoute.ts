import { Router } from "express";
const router = Router({ caseSensitive: true, strict: true });
import accessRateLimiter from "../../middlewares/accessRateLimiter";
import checkAccessKey from "../../middlewares/checkAccessKey";
import { handleExcelUpload } from "../../middlewares/multer";
import checkAuth from "../../middlewares/checkAuth";
import commonController from "./commonController";
import validation from "./commmonValidation";
// import controller from "./publicController";

router.post(
  `/getAccessKey`,
  accessRateLimiter,
//   validation.getAccessKey,
//   controller.getAccessKey

);


router.post(
  `/companyList`,
  accessRateLimiter,
// checkAccessKey,
// checkAuth.Manager,
// validation.companyList,
commonController.companyList
);

router.post(
  `/productList`,
  accessRateLimiter,
// checkAccessKey,
// checkAuth.Manager,
// validation.companyList,
commonController.productList
);

router.post(
  `/selectedProductDetail`,
  accessRateLimiter,
// checkAccessKey,
// checkAuth.Manager,
// validation.companyList,
commonController.selectedProductDetails

);


router.post(
  `/companyWarehouseAddresses`,
  accessRateLimiter,
// checkAccessKey,
// checkAuth.Manager,
// validation.companyList,
commonController.companyOtherAddressesList

);

router.post(
  `/search-companyName`,
  accessRateLimiter,
// checkAccessKey,
// checkAuth.Manager,
// validation.companyList,
commonController.companySearch

);

router.post(
  `/order-list`,
  accessRateLimiter,
  // checkAccessKey,
  // checkAuth.Manager,
  validation.orderList,
  commonController.orderList
);


export default router