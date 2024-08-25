import express from "express";
const router = express.Router();
import accessRateLimiter from "../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../middlewares/checkAccessKey";
import validation from "./departmentValidation";
import controller from "./departmentController";
import checkAuth from "../../../middlewares/checkAuth";

router.post(
  `/add-department`,
  accessRateLimiter,
  checkAuth.Manager,
  validation.addDepartment,
  controller.addDepartment
);

router.post(
  `/list-department`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.getDepartmentList,
  controller.getDepartmentList
);

router.put(
  `/update-department/:department_id`,
  accessRateLimiter,
  checkAuth.Manager,
  validation.updateDepartment,
  controller.updateDepartment
);
router.delete(
  `/delete-department`,
  accessRateLimiter,
  checkAuth.Manager,
  validation.deleteDepartment,
  controller.deleteDepartment
);

router.post(
  `/get-department/:department_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.getDepartment,
  controller.getDepartment
);

router.post(
  `/search-department`,
  accessRateLimiter,
  checkAccessKey,
  controller.searchDepartment
);

router.post(
  `/fetch-departments`,
  accessRateLimiter,
  checkAuth.Manager,
  controller.getAllDepartment
);

export default router;
