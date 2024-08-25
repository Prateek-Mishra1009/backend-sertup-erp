import { Router } from "express";
const router = Router({ caseSensitive: true, strict: true });
import accessRateLimiter from "../../middlewares/accessRateLimiter";
import checkAccessKey from "../../middlewares/checkAccessKey";
import validation from "./publicValidation";
import controller from "./publicController";
import { handleExcelUpload } from "../../middlewares/multer";
import publicController from "./publicController";
import publicValidation from "./publicValidation";
import checkAuth from "../../middlewares/checkAuth";

// router.post(
//   `/getAccessKey`,
//   accessRateLimiter,
//   validation.getAccessKey,
//   controller.getAccessKey
// );

// router.post(
//   `/send-otp`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.sendOTP,
//   controller.sendOTP
// );

// router.post(
//   `/send-otp/message`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.sendOTPMessage,
//   controller.sendOTPMessage
// );

// router.post(
//   `/send-otp/mail`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.sendOTPEmail,
//   controller.sendOTPEmail
// );

// router.post(
//   `/verify-otp`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.verifyOTP,
//   controller.verifyOTP
// );

// router.post(
//   `/verify-token`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.verifyToken,
//   controller.verifyToken
// );

// router.get(
//   `/page-detail/:slug`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.pageDetail,
//   controller.pageDetail
// );

// router.get(
//   `/web/maintenance-detail`,
//   accessRateLimiter,
//   checkAccessKey,
//   controller.getWebMaintenanceDetail
// );

// router.get(
//   `/app/maintenance-detail`,
//   accessRateLimiter,
//   checkAccessKey,
//   controller.getAppMaintenanceDetail
// );

// router.get(
//   `/inventory/maintenance-detail`,
//   accessRateLimiter,
//   checkAccessKey,
//   controller.getInventoryMaintenanceDetail
// );

// router.get(
//   `/inventory/app/maintenance-detail`,
//   accessRateLimiter,
//   checkAccessKey,
//   controller.getInventoryAppMaintenanceDetail
// );

// router.get(
//   `/support/maintenance-detail`,
//   accessRateLimiter,
//   checkAccessKey,
//   controller.getSupportMaintenanceDetail
// );

router.post(
  `/locality-detail`,
  accessRateLimiter,
  checkAccessKey,
  validation.localityDetail,
  controller.localityDetail
);

// router.post(
//   `/state-list`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.stateList,
//   controller.stateList
// );

// router.post(
//   `/find-city`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.findCity,
//   controller.findCity
// );

// router.post(
//   `/give-feedback`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.giveFeedback,
//   controller.giveFeedback
// );

// router.post(
//   `/brand-list`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.brandList,
//   controller.brandList
// );

// router.post(
//   `/class-list`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.classList,
//   controller.classList
// );

// router.post(
//   `/manufacture-list`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.manufactureList,
//   controller.manufactureList
// );

// router.post(
//   `/category-list`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.categoryList,
//   controller.categoryList
// );

// router.post(
//   `/subCategory-list`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.subCategoryList,
//   controller.subCategoryList
// );

// router.post(
//   `/subChildCategory-list`,
//   accessRateLimiter,
//   checkAccessKey,
//   validation.subChildCategoryList,
//   controller.subChildCategoryList
// );

// router.post(
//   `/get-image`,
//   checkAccessKey,
//   validation.getImage,
//   controller.getImage
// );

router.post(
  `/upload-color`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  handleExcelUpload,
 publicController.addColorsBulk
);

router.post(
  `/uploadHsn`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  handleExcelUpload,
 publicController.uploadHsnBulk
);

router.post(
  `/hsn-list`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.hsnList,
  controller.hsnList
);

router.post('/get-selfAddresses',
  accessRateLimiter,
  checkAccessKey,
  publicValidation.getSelfAddresses,
  publicController.getSelfAddresses
)

export default router;

