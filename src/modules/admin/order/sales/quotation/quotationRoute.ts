import { Router } from "express";
const router = Router({ caseSensitive: true, strict: false });
import accessRateLimiter from "../../../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../../../middlewares/checkAccessKey";
import checkAuth from "../../../../../middlewares/checkAuth";
import validation from "../quotation/quotationValidation"
import controller from "./quotationController";

  router.post(
    `/create-quotation`,
    accessRateLimiter,
    // checkAccessKey,
    // checkAuth.Manager,
    validation.createSalesQuotation,
    controller.createSalesQuotation
  );

  router.post(
    `/quotation-detail`,
    accessRateLimiter,
    // checkAccessKey,
    // checkAuth.Manager,
    // validation.createSalesQuotation,
    controller.getQuotationDetail
  );

  router.post(
    `/quotation-list`,
    accessRateLimiter,
    // checkAccessKey,
    // checkAuth.Manager,
    validation.quotationList,
    controller.QuotationList
  );

  export default router
