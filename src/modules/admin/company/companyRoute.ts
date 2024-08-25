import express from "express";
const router = express.Router();
import accessRateLimiter from "../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../middlewares/checkAccessKey";
import validation from "./companyValidation";
import controller from "./companyController";
import checkAuth from "../../../middlewares/checkAuth";
import {
  handleExcelUpload,
  handleLogoUpload,
  handleProfileUpload,
} from "../../../middlewares/multer";

router.post(
  `/company-upload-bulk`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  handleExcelUpload,
  validation.addCompanyBulk,
  controller.addCompanyBulk
);

router.post(
  `/add-company`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.create,
  controller.create
);

router.post(
  `/company-detail/:company_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.detail,
  controller.detail
);

router.put(
  `/update-detail/:company_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.update,
  controller.update
);

router.delete(
  `/delete-company`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.deleteCompany,
  controller.deleteCompany
);

router.post(
  `/companyList`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.companyList,
  controller.companyList
);

router.put(
  `/change-companyLogo/:company_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  handleLogoUpload,
  validation.changeCompanyLogo,
  controller.changeCompanyLogo
);

export default router;
