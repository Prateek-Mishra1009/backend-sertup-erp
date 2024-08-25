import { Router } from "express";
const router = Router({ caseSensitive: true, strict: true });
import accessRateLimiter from "../../middlewares/accessRateLimiter";
import checkAccessKey from "../../middlewares/checkAccessKey";
import checkAuth from "../../middlewares/checkAuth";
import validation from "./adminValidation";
import controller from "./adminController";
import { handleLogoUpload, handleProfileUpload } from "../../middlewares/multer";

router.post(
  `/login`,
  accessRateLimiter,
  checkAccessKey,
  validation.login,
  controller.login
);

router.post(
  `/google-login`,
  accessRateLimiter,
  checkAccessKey,
  validation.googleLogin,
  controller.googleLogin
);


router.post(
  `/get-detail`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  controller.getDetail
);

router.put(
  `/change-profilePicture`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  handleProfileUpload,
  validation.changeProfilePicture,
  controller.changeProfilePicture
);

router.put(
  `/update-detail`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.updateDetail,
  controller.updateDetail
);

router.post(
  `/verify-email`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.verifyEmail,
  controller.verifyEmail
);

router.post(
  `/verify-phone`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.verifyPhone,
  controller.verifyPhone
);

router.put(
  `/update-email`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.updateEmail,
  controller.updateEmail
);

router.put(
  `/update-phone`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.updatePhone,
  controller.updatePhone
);

router.put(
  `/change-password`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.changePassword,
  controller.changePassword
);

router.put(
  `/manage-authentication`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.manageAuthentication,
  controller.manageAuthentication
);

router.put(
  `/manage/push/notification`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.manageNotification,
  controller.managePushNotification
);

router.put(
  `/manage/email/notification`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.manageNotification,
  controller.manageEmailNotification
);

router.put(
  `/manage/message/notification`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.manageNotification,
  controller.manageMessageNotification
);

router.post(
  `/deactivate-account`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.deactivateAccount,
  controller.deactivateAccount
);

router.delete(
  `/delete-account`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.deleteAccount,
  controller.deleteAccount
);

router.post(
  `/logout`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  controller.logout
);

router.post(
  `/logout-all`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  controller.logoutFromAll
);

router.post(
  `/forgot-password`,
  accessRateLimiter,
  checkAccessKey,
  validation.forgotPassword,
  controller.forgotPassword
);

router.put(
  `/reset-password`,
  accessRateLimiter,
  checkAccessKey,
  validation.resetPassword,
  controller.resetPassword
);

router.put(
  `/update-self-company`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.updateCompany,
  controller.updateCompany
);

router.post(
  `/get-company-detail`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.companyDetail,
  controller.companyDetail
);

router.put(
  `/change-selfCompanyLogo`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  handleLogoUpload,
  validation.changeSelfCompanyLogo,
  controller.changeSelfCompanyLogo
);

export default router;
