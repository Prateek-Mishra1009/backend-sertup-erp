import { Request, Response, NextFunction } from "express";
import validator from "../../../helpers/validator";
import constants from "../../../utils/constants";
import { getMessage, validateRequestData } from "../../../helpers/helper";

const selectStock = async (req: any, res: Response, next: NextFunction) => {
    try {
        const validationRule = {
            locationId: "string|size:24",
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

const stockHistory = async (req: any, res: Response, next: NextFunction) => {
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
const stockTransferDetail = async (req: any, res: Response, next: NextFunction) => {
    try {
        const validationRule = {
            transffer_id:"required|string|size:24",
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


const stockTransfer = async (req: any, res: Response, next: NextFunction) => {
    try {
        const validationRule = {
            //  products: "required|array",
            // "products.*.product_id": "required|string|size:24",
            // "products.*.quantity": "required|numeric",
            // "products.*.price": "required|string",
            // sourceLocation:"required|string|size:24",
            // destinationLocation:"required|string|size:24",
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

const downloadStockHistoryExcel = async (req: any, res: Response, next: NextFunction) => {
    try {
        const validationRule = {
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





export default { selectStock, stockTransfer, stockHistory,downloadStockHistoryExcel,stockTransferDetail}