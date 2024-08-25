import { Request, Response, NextFunction } from "express";
import validator from "../../../helpers/validator";
import constants from "../../../utils/constants";
import { getMessage, validateRequestData } from "../../../helpers/helper";
import Address from "../../../models/address";
import message from "./addressConstant";

const create = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validationRule = {
      name: "required|string|min:3|max:80",
      company_id: "required|string|size:24",
      email: "required|string|email",
      phone: "required|string|verifyPhone",
      address_type: `required|string|in:${constants.addressTypes.shipping},${constants.addressTypes.warehouse}`,
      address_line_one: "required|string|min:3|max:150",
      address_line_two: "string|min:3|max:150",
      city: "required|string|min:3|max:80|checkString",
      state: "required|string|min:3|max:80|checkString",
      country: "required|string|min:3|checkString",
      pin_code: "required|string|min:5|checkPinCode",
      landmark: "string|min:3|max:80",
      latitude: "string|min:3|max:15",
      longitude: "string|min:3|max:15",
      checked:"required|boolean|in:true,false"
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

const detail = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validationRule = {
      address_id: "required|string|size:24",
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

const addressList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validationRule = {
      company_id: "required|string|size:24",
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

const update = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validationRule = {
      name: "required|string|min:3|max:80|checkString",
      company_id: "required|string|size:24",
      phone: "required|string|verifyPhone",
      address_type: `required|string|in:${constants.addressTypes.shipping},${constants.addressTypes.work},${constants.addressTypes.warehouse}`,
      address_line_one: "required|string|min:3|max:150",
      address_line_two: "string|min:3|max:150",
      cityId: "required|string|size:24",
      email: "required|string|email",
      stateId: "required|string|size:24",
      countryId: "required|string|size:24",
      pinCode: "required|string|min:5|checkPinCode",
      landmark: "string|min:3|max:80",
      latitude: "string|min:3|max:15",
      longitude: "string|min:3|max:15",
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

const deleteAddress = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validationRule = {
      is_delete: "required|boolean|in:true,false",
      company_id: "required|string|size:24",
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


const changePrimaryAddress= async (req: any, res: Response, next: NextFunction) => {
  try {
    const validationRule = {
      address_id: "required|string|size:24",
      company_id: "required|string|size:24",
      address_type:`required|string|in:${constants.addressTypes.warehouse},${constants.addressTypes.shipping},${constants.addressTypes.work}`,
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


export default {
  create,
  addressList,
  detail,
  update,
  deleteAddress,
  changePrimaryAddress
};
