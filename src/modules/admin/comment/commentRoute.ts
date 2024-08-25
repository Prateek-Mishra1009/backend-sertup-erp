import { Router } from "express";
const router = Router({ caseSensitive: true, strict: false });
import accessRateLimiter from "../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../middlewares/checkAccessKey";
import checkAuth from "../../../middlewares/checkAuth";
import validation from "./commentValidation";
import controller from "./commentController";

router.post(
  `/add-comment`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.addComment,
  controller.addComment
);

// router.put(
//   `/update-comment/:comment_id`,
//   accessRateLimiter,
//   checkAccessKey,
//   checkAuth.Manager,
//   validation.updateComment,
//   controller.updateComment
// );

// router.delete(
//   `/delete-comment/:comment_id`,
//   accessRateLimiter,
//   checkAccessKey,
//   checkAuth.Manager,
//   validation.deleteComment,
//   controller.deleteComment
// );

export default router;
