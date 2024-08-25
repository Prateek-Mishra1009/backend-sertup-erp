import { Router } from "express";
const router = Router({ caseSensitive: true, strict: false });
import accessRateLimiter from "../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../middlewares/checkAccessKey";
import checkAuth from "../../../middlewares/checkAuth";
import controller from "./orderController";

  router.post(
    `/create-order`,
    accessRateLimiter,
    // checkAccessKey,
    // checkAuth.Manager,
    // validation.addProduct,
    controller.createOrder
  );


  export default router

  