import { Response,NextFunction } from "express";
import validator from "../../../../helpers/validator";
import constants from "../../../../utils/constants";
import { getMessage } from "../../../../helpers/helper";


const createSalesOrder= async(req:any, res:Response,next:NextFunction)=>{
    try {
        console.log()
    } catch (error) {
        
    }
}


const getQuotationDetail= async(req:any, res:Response, next:NextFunction)=>{
 try {
  
 } catch (error) {
    
 }
}

const salesReturn= async(req:any,res:Response,next:NextFunction)=>{
  try {
    const validationRule = {
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
  } catch (error) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
}


const orderList = async (req: any, res: Response, next: NextFunction) => {
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
  }

export default {createSalesOrder,getQuotationDetail,salesReturn}