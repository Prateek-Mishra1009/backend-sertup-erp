import { Router } from "express";
const router = Router({ caseSensitive: true, strict: true });
import accessRateLimiter from "../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../middlewares/checkAccessKey";
import checkAuth from "../../../middlewares/checkAuth";
import validation from "./addressValidation";
import controller from "./addressController";

router.post(
  `/add-address`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.create,
  controller.create
);

router.post(
  `/address-list/:company_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.addressList,
  controller.addressList
);

router.post(
  `/address-detail/:address_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.detail,
  controller.detail
);

router.put(
  `/update-detail/:address_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.update,
  controller.update
);

router.delete(
  `/delete-address/:address_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.deleteAddress,
  controller.deleteAddress
);
router.put(
  `/change-primary-address`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Manager,
  validation.changePrimaryAddress,
  controller.changePrimaryAddress
)

router.post(
  `/get-address`,
  accessRateLimiter,
  // checkAccessKey,
  // checkAuth.Manager,
  // validation.changePrimaryAddress,
  controller.getAddressByCompanyId
)

export default router;
