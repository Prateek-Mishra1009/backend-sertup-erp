import {Response, NextFunction } from "express";
import constants from "../../../utils/constants";

const createOrder= async(req:any,res:Response,next:NextFunction)=>{
  try {
    
    console.log("creating order");
  } catch (error) {
     res.status(constants.code.preconditionFailed).json({
        status:constants.status.statusFalse,
        userStatus:req.status,
        message:error
     })
  }
}

export default {createOrder}