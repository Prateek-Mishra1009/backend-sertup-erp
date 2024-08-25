import express from "express";
const router = express.Router();
import accessRateLimiter from "../../../../middlewares/accessRateLimiter";
import checkAccessKey from "../../../../middlewares/checkAccessKey";
import controller from "./bankController";
import validation from "./bankValidation"
import checkAuth from "../../../../middlewares/checkAuth";


router.post(
  `/add-bank`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Admin,
  validation.addBank,
  controller.addBank
);


router.put(
  `/update-bank/:bank_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Admin,
  validation.updateBank,
  controller.updateBank
);            

router.post(
  `/list-bank`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Admin,
  validation.listBank,
  controller.listBank
);         



router.post(
  `/get-bank/:bank_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Admin,
  validation.bankDetail,
  controller.bankDetail
);  


router.delete(
  `/delete-bank/:bank_id`,
  accessRateLimiter,
  checkAccessKey,
  checkAuth.Admin,
  validation.deleteBank,
  controller.deleteBank
);  



export default  router