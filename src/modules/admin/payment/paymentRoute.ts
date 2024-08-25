import { Router } from "express";
const router = Router({ caseSensitive: true, strict: false });
import accessRateLimiter from "../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../middlewares/checkAccessKey";
import checkAuth from "../../../middlewares/checkAuth";
import validation from "./paymentValidation";
import controller from "./paymentController";

router.post(
  `/create-payment`,
  accessRateLimiter,
  // checkAccessKey,
//   checkAuth.Manager,
  validation.createPayment,
  controller.createPayment
);


export default router;
