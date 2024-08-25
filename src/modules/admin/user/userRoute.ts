import { Router } from "express";
const router = Router({ caseSensitive: true, strict: false });
import accessRateLimiter from "../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../middlewares/checkAccessKey";
import checkAuth from "../../../middlewares/checkAuth";
import { handleProfileUpload } from "../../../middlewares/multer";
import validation from "./userValidation";
import controller from "./userController";

router.post(
  `/add-user`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.create,
  controller.create
);

router.post(
  `/user-list`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.usersList,
  controller.usersList
);

router.post(
  `/user-detail/:user_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.detail,
  controller.detail
);

router.put(
  `/change-profilePicture/:user_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  handleProfileUpload,
  validation.changeProfilePicture,
  controller.changeProfilePicture
);

router.put(
  `/update-detail/:user_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.update,
  controller.update
);

//Below api is of no use here
router.put(
  `/reset-password/:user_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.resetPassword,
  controller.resetPassword
);

router.put(
  `/manage-account/:user_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.manageAccount,
  controller.manageAccount
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
  `/deactivate-account/:user_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.deactivateAccount,
  controller.deactivateAccount
);

export default router;
