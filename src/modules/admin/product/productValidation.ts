import { Request, Response, NextFunction } from "express";
import validator from "../../../helpers/validator";
import constants from "../../../utils/constants";
import { getMessage, validateRequestData } from "../../../helpers/helper";

const productList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validationRule = {
      page: "required|string",
      limit: "required|string",
      sort: "required|string|in:asc,desc",
      search: "string",
    };
    const msg = {};

    await validator(
      req.query,
      validationRule,
      msg,
      async (err: any, status: boolean) => {
        if (!status) {
          res.status(constants.code.preconditionFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: await getMessage(err),
          });
        } else if (
          (await validateRequestData(validationRule, req.query)) !== true
        ) {
          res.status(constants.code.expectationFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: constants.message.unwantedData,
          });
        } else {
          next();
        }
      }
    );
  } catch (err) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

const detail = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validationRule = {
      product_id: "required|string|size:24",
    };
    const msg = {};

    await validator(
      req.params,
      validationRule,
      msg,
      async (err: any, status: boolean) => {
        if (!status) {
          res.status(constants.code.preconditionFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: await getMessage(err),
          });
        } else if (
          (await validateRequestData(validationRule, req.params)) !== true
        ) {
          res.status(constants.code.expectationFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: constants.message.unwantedData,
          });
        } else {
          next();
        }
      }
    );
  } catch (err) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

const addProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validationRule = {
      name: "required|string",
      description: "string",
      // batch_number: "string|max:17|min:1",
      product_code: "string|max:12|min:1",
      brand_id: "required|string|size:24",
      standard:"required|string",
      category_id: "required|string|size:24",
      subCategory_id: "string|size:24",
      subChildCategory_id: "string|size:24",
      painttype_id: "string|size:24",
      finishtype_id: "string|size:24",
      uom_id: "string|size:24",
      // margin: "numeric|required|max:99|min:1",
      productType: "string|required",
      packQuantity: "string|required",
      //paint_type:`string|required|in:${constants.paintType.acrylic},${constants.paintType.latex},${constants.paintType.oil}`,
      //paint_finish:`string|required|in:${constants.paintFinish.matte},${constants.paintFinish.gloss}`,
      color_id: "string|size:24",
      unit_price: "string",
      hsn_id: "required|string|size:24",
      selling_price: "required|string",
      cost_price: "required|string",
      product_weight: "string|required",
      //product_weight_unit: `required|string|in:${constants.massUnit.l},${constants.massUnit.kg}`,
    };
    const msg = {};

    await validator(
      req.body,
      validationRule,
      msg,
      async (err: any, status: boolean) => {
        if (!status) {
          res.status(constants.code.preconditionFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: await getMessage(err),
          });
        } else if (
          (await validateRequestData(validationRule, req.body)) !== true
        ) {
          res.status(constants.code.expectationFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: constants.message.unwantedData,
          });
        } else {
          next();
        }
      }
    );
  } catch (err) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

const createProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validationRule = {
      name: "required|string",
      // batch_number: "string|max:17|min:1",
      product_code: "string|max:12|min:1",
      brand_id: "required|string|size:24",
      category_id: "required|string|size:24",
      subCategory_id: "string|size:24",
      standard: "string|required",
      // margin: "numeric|required|max:99|min:1",
      subChildCategory_id: "string|size:24",
      painttype_id: "string|size:24",
      finishtype_id: "string|size:24",
      uom_id: "string|size:24",
      color_id: "string|size:24",
      unit_price: "string",
      hsn_id: "required|string|size:24",
      selling_price: "required|string",
      cost_price: "required|string",
      product_weight: "string|required",
      quantity: "numeric|required",
      tinters_productId: "string|size:24",
      base_paint_one_productId: "string|required|size:24",
      base_paint_two_productId: "string|required|size:24",
      base_paint_one_product_weight: "string|required",
      base_paint_one_uomId: "string|required|size:24",
      base_paint_two_product_weight: "string|required",
      base_paint_two_uomId: "string|required|size:24",
      tinters: "required|array",
      "tinters.*.productId": "required|string|size:24",
      "tinters.*.weight": "required|string",
      "tinters.*.uomId": "required|string|size:24",
    };
    const msg = {};

    await validator(
      req.body,
      validationRule,
      msg,
      async (err: any, status: boolean) => {
        if (!status) {
          res.status(constants.code.preconditionFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: await getMessage(err),
          });
        } else if (
          (await validateRequestData(validationRule, req.body)) !== true
        ) {
          res.status(constants.code.expectationFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: constants.message.unwantedData,
          });
        } else {
          next();
        }
      }
    );
  } catch (err) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

const productDetail = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validationRule = {
      product_id: "required|string|size:24",
    };
    const msg = {};

    await validator(
      req.params,
      validationRule,
      msg,
      async (err: any, status: boolean) => {
        if (!status) {
          res.status(constants.code.preconditionFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: await getMessage(err),
          });
        } else if (
          (await validateRequestData(validationRule, req.body)) !== true
        ) {
          res.status(constants.code.expectationFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: constants.message.unwantedData,
          });
        } else {
          next();
        }
      }
    );
  } catch (err) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validationRule = {
      is_delete: "required|boolean|in:true,false",
      product_ids: "required|array",
    };
    // const validationRule = {
    //   is_delete: "required|boolean|in:true,false",
    //   product_ids: {
    //     required: true,
    //     isArray: true,
    //     custom: {
    //       options: async (value: any) => {
    //         if (!value.every((id: string) => id.length === 24)) {
    //           throw new Error("All product_ids must be strings of length 24.");
    //         }
    //       }
    //     }
    //   }
    // };
    const msg = {};

    await validator(
      req.body,
      validationRule,
      msg,
      async (err: any, status: boolean) => {
        if (!status) {
          res.status(constants.code.preconditionFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: await getMessage(err),
          });
        } else if (
          (await validateRequestData(validationRule, req.body)) !== true
        ) {
          res.status(constants.code.expectationFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: constants.message.unwantedData,
          });
        } else {
          next();
        }
      }
    );
  } catch (err) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

const updateBasicDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationRule = {
      name: "required|string",
      // batch_number: "required|string|max:17|min:1",
      product_code: "string|max:12|min:1",
      brand_id: "required|string|size:24",
      category_id: "required|string|size:24",
      subCategory_id: "string|size:24",
      subChildCategory_id: "string|size:24",
      color_id: "string|size:24",
      product_weight: "string|required",
      uom_id: "required|string|size:24",
    };
    const msg = {};

    await validator(
      req.body,
      validationRule,
      msg,
      async (err: any, status: boolean) => {
        if (!status) {
          res.status(constants.code.preconditionFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: await getMessage(err),
          });
        } else {
          next();
        }
      }
    );
  } catch (err) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

const updateOtherDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationRule = {
      painttype_id: "string|size:24",
      finishtype_id: "string|size:24",
      description: "string",
    };
    const msg = {};

    await validator(
      req.body,
      validationRule,
      msg,
      async (err: any, status: boolean) => {
        if (!status) {
          res.status(constants.code.preconditionFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: await getMessage(err),
          });
        } else {
          next();
        }
      }
    );
  } catch (err) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

const updatePriceDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationRule = {
      selling_price: "required|string",
      cost_price: "required|string",
      unit_price: "required|string",
    };
    const msg = {};

    await validator(
      req.body,
      validationRule,
      msg,
      async (err: any, status: boolean) => {
        if (!status) {
          res.status(constants.code.preconditionFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: await getMessage(err),
          });
        } else {
          next();
        }
      }
    );
  } catch (err) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

const updatePaintFormula = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationRule = {
      base_paint_one_productId: "string|required|size:24",
      base_paint_one_product_weight: "required|numeric",
      base_paint_one_uomId: "string|required|size:24",
      base_paint_two_productId: "string|required|size:24",
      base_paint_two_product_weight: "required|numeric",
      base_paint_two_uomId: "string|required|size:24",
      total_quantity: "required|numeric",
      tinters: "array|required",
      "tinters.*.productId": "string|required|size:24",
      "tinters.*.weight.unit": `required|string|size:24`,
      "tinters.*.weight.value": "required|numeric",
    };
    const msg = {};

    await validator(
      req.body,
      validationRule,
      msg,
      async (err: any, status: boolean) => {
        if (!status) {
          res.status(constants.code.preconditionFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: await getMessage(err),
          });
        } else {
          next();
        }
      }
    );
  } catch (err) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

export default {
  productList,
  detail,
  addProduct,
  createProduct,
  productDetail,
  deleteProduct,
  updateBasicDetails,
  updateOtherDetails,
  updatePriceDetails,
  updatePaintFormula,
};
