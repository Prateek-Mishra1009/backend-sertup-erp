import { Router } from "express";
const router = Router({ caseSensitive: true, strict: false });
import accessRateLimiter from "../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../middlewares/checkAccessKey";
import checkAuth from "../../../middlewares/checkAuth";
import validation from "./catalougeValidation";
import controller from "./catalougeController";
import { handleImageUpload } from "../../../middlewares/multer";

router.post(
  `/add-brand`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.addBrand,
  controller.addBrand
);

router.post(
  `/brand-detail/:brand_id`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.brandDetail,
  controller.brandDetail
);

router.post(
  `/brand-list`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  controller.brandList
);

router.put(
  `/update-brand/:brand_id`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.updateBrand,
  controller.updateBrand
);

router.delete(
  `/delete-brand/:brand_id`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.deleteRecord,
  controller.deleteBrand
);

router.post(
  `/add-category`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.addCategory,
  controller.addCategory
);

router.post(
  `/category-detail/:category_id`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.categoryDetail,
  controller.categoryDetail
);

router.post(
  `/category-list`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.list,
  controller.categoryList
);

router.put(
  `/update-category/:category_id`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.updateCategory,
  controller.updateCategory
);

router.delete(
  `/delete-category/:category_id`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.deleteRecord,
  controller.deleteCategory
);

router.post(
  `/add-subCategory`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.addSubCategory,
  controller.addSubCategory
);

router.post(
  `/subCategory-detail/:subCategory_id`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.subCategoryDetail,
  controller.subCategoryDetail
);

router.post(
  `/subCategory-list`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.list,
  controller.subCategoryList
);

router.put(
  `/update-subCategory/:subCategory_id`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.updateSubCategory,
  controller.updateSubCategory
);

router.delete(
  `/delete-subCategory/:subCategory_id`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.deleteRecord,
  controller.deleteSubCategory
);

router.post(
  `/add-subChildCategory`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.addSubChildCategory,
  controller.addSubChildCategory
);

router.post(
  `/subChildCategory-detail/:subChildCategory_id`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.subChildCategoryDetail,
  controller.subChildCategoryDetail
);

router.post(
  `/subChildCategory-list`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.list,
  controller.subChildCategoryList
);

router.put(
  `/update-subChildCategory/:subChildCategory_id`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.updateSubChildCategory,
  controller.updateSubChildCategory
);

router.delete(
  `/delete-subChildCategory/:subChildCategory_id`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Admin,
  validation.deleteRecord,
  controller.deleteSubChildCategory
);

router.post(
  `/add-color`,
  accessRateLimiter,
  checkAccessKey,
  // checkAuth.Manager,
  validation.addColor,
  controller.addColor
);

router.post(
  `/color-list`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.list,
  controller.colorList
);

router.delete(
  `/delete-color/:color_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.deleteRecord,
  controller.deleteColor
);

router.post(
  `/tinters-list`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.tintersList,
  controller.tintersList
);

router.post(
  `/add-finishType`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.addFinishType,
  controller.addFinishType
);

router.put(
  `/update-finishType/:finishType_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.updateFinishType,
  controller.updateFinishType
);

router.post(
  `/finishtype-list`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.list,
  controller.finishTypeList
);


router.delete(
  `/delete-finishType/:finishType_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.deleteRecord,
  controller.deleteFinishType
);


router.post(
  `/add-paintType`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.addPaintType,
  controller.addPaintType
);

router.put(
  `/update-paintType/:paintType_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.updatePaintType,
  controller.updatePaintType
);


router.post(
  `/painttype-list`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.list,
  controller.paintTypeList
);

router.delete(
  `/delete-paintType/:paintType_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.deleteRecord,
  controller.deletePaintType
);


router.post(
  `/add-uom`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.addUOM,
  controller.addUOM
);

router.put(
  `/update-uom/:uom_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.updateUOM,
  controller.updateUOM
);


router.post(
  `/uom-list`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.list,
  controller.UOMList
);

router.delete(
  `/delete-uom/:uom_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.deleteRecord,
  controller.deleteUOM
);

export default router;