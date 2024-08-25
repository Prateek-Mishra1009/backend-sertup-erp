import { Router } from "express";
const router = Router({ caseSensitive: true, strict: false });
import accessRateLimiter from "../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../middlewares/checkAccessKey";
import checkAuth from "../../../middlewares/checkAuth";
import validation from "./emailValidation";
import controller from "./emailController";

router.post(
  `/add-email`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.create,
  controller.create
);

router.post(
  `/email-list`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.emailList,
  controller.emailList
);

router.post(
  `/email-detail/:slug`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.detail,
  controller.detail
);

router.put(
  `/update-detail/:slug`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.update,
  controller.update
);

router.delete(
  `/delete-email`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.deleteEmail,
  controller.deleteEmail
);

export default router;
