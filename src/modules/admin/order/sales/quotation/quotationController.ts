//sample json to create quotation schema

import { NextFunction,Request,Response } from "express";
import Quotation from "../../../../../models/quotation";
import constants from "../../../../../utils/constants";
import  {generateDocumentNumber, salesQuotationNumber}  from "../../../../../helpers/helper";
import Address from "../../../../../models/address";
import message from "./quotationConstant";
import Invoice from "../../../../../models/invoice";
import path from "path";
import mongoose from "mongoose";
import createQuotation from "../../../../../helpers/generateSalesQuotation";
import sendMail from "../../../../../helpers/mail";
import { readFileSync } from "fs";



const getQuotationDetail= async(req:any,res:Response)=>{
    try {
         await Quotation.findOne({
            _id:new mongoose.Types.ObjectId(req.body.quotationId),
            isDeleted:false
          }).then(async(quotationData)=>{
                if(!quotationData){
                    throw{
                        statusCode:constants.code.dataNotFound,
                        message:constants.message.dataNotFound
                    }
                }
                else{
                 await Quotation.aggregate([{$match:{_id:quotationData._id,isDeleted:false}},
                    {
                        $lookup: {
                          from: "addresses",
                          let: { billingAddressId: "$billingAddressId" },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $and: [
                                    { $eq: ["$_id", "$$billingAddressId"] },
                                    { $eq: ["$isDeleted", false] },
                                  ],
                                },
                              },
                            },
                            {
                              $lookup: {
                                from: "cities",
                                localField: "address.city",
                                foreignField: "_id",
                                as: "city_info",
                              },
                            },
                            {
                              $unwind: {
                                path: "$city_info",
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                            {
                              $lookup: {
                                from: "states",
                                localField: "address.state",
                                foreignField: "_id",
                                as: "state_info",
                              },
                            },
                            {
                              $unwind: {
                                path: "$state_info",
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                            {
                              $lookup: {
                                from: "countries",
                                localField: "address.country",
                                foreignField: "_id",
                                as: "country_info",
                              },
                            },
                            {
                              $unwind: {
                                path: "$country_info",
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                            {
                              $project: {
                                address: 1,
                                phone: 1,
                                email: 1,
                                companyId: 1,
                                landmark: 1,
                                city: "$city_info.name",
                                state: "$state_info.name",
                                country: "$country_info.name",
                              },
                            },
                          ],
                          as: "billing_address",
                        },
                      },
                      {
                        $unwind: {
                          path: "$billing_address",
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      
                      {
                        $lookup: {
                          from: "addresses",
                          let: { shippingAddressId: "$shippingAddressId" },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $and: [
                                    { $eq: ["$_id", "$$shippingAddressId"] },
                                    { $eq: ["$isDeleted", false] },
                                  ],
                                },
                              },
                            },
                            {
                              $lookup: {
                                from: "cities",
                                localField: "address.city",
                                foreignField: "_id",
                                as: "city_info",
                              },
                            },
                            {
                              $unwind: {
                                path: "$city_info",
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                            {
                              $lookup: {
                                from: "states",
                                localField: "address.state",
                                foreignField: "_id",
                                as: "state_info",
                              },
                            },
                            {
                              $unwind: {
                                path: "$state_info",
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                            {
                              $lookup: {
                                from: "countries",
                                localField: "address.country",
                                foreignField: "_id",
                                as: "country_info",
                              },
                            },
                            {
                              $unwind: {
                                path: "$country_info",
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                            {
                              $project: {
                                address: 1,
                                phone: 1,
                                email: 1,
                                companyId: 1,
                                landmark: 1,
                                city: "$city_info.name",
                                state: "$state_info.name",
                                country: "$country_info.name",
                              },
                            },
                          ],
                          as: "shipping_address",
                        },
                      },
                      {
                        $unwind: {
                          path: "$shipping_address",
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: "addresses",
                          let: { companyId: "$shipping_address.companyId" },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $and: [
                                    { $eq: ["$companyId", "$$companyId"] },
                                    {$eq:["$type",constants.addressTypes.work]},
                                    { $eq: ["$isDeleted", false] },
                                  ],
                                },
                              },
                            },
                            {
                              $lookup: {
                                from: "cities",
                                localField: "address.city",
                                foreignField: "_id",
                                as: "city_info",
                              },
                            },
                            {
                              $unwind: {
                                path: "$city_info",
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                            {
                              $lookup: {
                                from: "states",
                                localField: "address.state",
                                foreignField: "_id",
                                as: "state_info",
                              },
                            },
                            {
                              $unwind: {
                                path: "$state_info",
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                            {
                              $lookup: {
                                from: "countries",
                                localField: "address.country",
                                foreignField: "_id",
                                as: "country_info",
                              },
                            },
                            {
                              $unwind: {
                                path: "$country_info",
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                            {
                              $project: {
                                address: 1,
                                phone: 1,
                                email: 1,
                                companyId:1,
                                landmark: 1,
                                city: "$city_info.name",
                                state: "$state_info.name",
                                country: "$country_info.name",
                              },
                            },
                          ],
                          as: "shipping_address.primaryShippingAddress",
                        },
                      },
                      {
                        $unwind: {
                          path: "$shipping_address.primaryShippingAddress",
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: "addresses",
                          let: { companyId: "$billing_address.companyId" },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $and: [
                                    { $eq: ["$companyId", "$$companyId"] },
                                    {$eq:["$type",constants.addressTypes.work]},
                                    { $eq: ["$isDeleted", false] },
                                  ],
                                },
                              },
                            },
                            {
                              $lookup: {
                                from: "cities",
                                localField: "address.city",
                                foreignField: "_id",
                                as: "city_info",
                              },
                            },
                            {
                              $unwind: {
                                path: "$city_info",
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                            {
                              $lookup: {
                                from: "states",
                                localField: "address.state",
                                foreignField: "_id",
                                as: "state_info",
                              },
                            },
                            {
                              $unwind: {
                                path: "$state_info",
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                            {
                              $lookup: {
                                from: "countries",
                                localField: "address.country",
                                foreignField: "_id",
                                as: "country_info",
                              },
                            },
                            {
                              $unwind: {
                                path: "$country_info",
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                            {
                              $project: {
                                address: 1,
                                phone: 1,
                                email: 1,
                                companyId:1,
                                landmark: 1,
                                city: "$city_info.name",
                                state: "$state_info.name",
                                country: "$country_info.name",
                              },
                            },
                          ],
                          as: "billing_address.primaryBillingAddress",
                        },
                      },
                      {
                        $unwind: {
                          path: "$billing_address.primaryBillingAddress",
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: "companies",
                          let: { companyId: "$billing_address.primaryBillingAddress.companyId"},
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $and: [
                                    { $eq: ["$_id", "$$companyId"] },
                                    { $eq: ["$isDeleted", false] },
                                  ],
                                },
                              },
                            },
                            {
                              $project: {
                                name: 1,
                                companyEmail: 1,
                                companyPhone: 1,
                                contactPerson: 1,
                                salesPerson:1,
                                logoUrl:1,
                                pan:1,
                                companyId:1,
                                gst:1
                              },
                            },
                          ],
                          as: "billing_address.primaryBillingAddress.billingCompanyDetail",
                        },
                      },
                   
                      {
                        $unwind: {
                          path: "$billing_address.primaryBillingAddress.billingCompanyDetail",
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                   
                      {
                        $lookup: {
                          from: "companies",
                          let: { companyId: "$shipping_address.primaryShippingAddress.companyId"},
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $and: [
                                    { $eq: ["$_id", "$$companyId"] },
                                    { $eq: ["$isDeleted", false] },
                                  ],
                                },
                              },
                            },
                            {
                              $project: {
                                name: 1,
                                companyEmail: 1,
                                companyPhone: 1,
                                contactPerson: 1,
                                salesPerson:1,
                                logoUrl:1,
                                pan:1,
                                companyId:1,
                                gst:1
                              },
                            },
                          ],
                          as: "shipping_address.primaryShippingAddress.companyDetail",
                        },
                      },
                   
                      {
                        $unwind: {
                          path: "$shipping_address.primaryShippingAddress.companyDetail",
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                   
                      {
                        $unwind: "$items",
                      },
                      {
                        $lookup: {
                          from: "products",
                          // localField: "items.productId",
                          // foreignField: "_id",
                          // as: "items.productDetails",
                          let: { productId: "$items.productId" },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $and: [
                                    { $eq: ["$_id", "$$productId"] },
                                    { $eq: ["$isDeleted", false] },
                                  ],
                                },
                              },
                            },
                          ],
                          as: "items.productDetails"
                        },
                      },
                      {
                        $unwind: "$items.productDetails",
                      },
                      {
                        $lookup: {
                          from: "hsns",
                          let: { hsnId: "$items.productDetails.HSN" },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $and: [
                                    { $eq: ["$_id", "$$hsnId"] },
                                    { $eq: ["$isDeleted", false] },
                                  ],
                                },
                              },
                            },
                            {
                              $project: {
                                hsn: 1
                              },
                            },
                          ],
                          as: "items.productDetails.hsn_detail"
                        }
                      },
                      {
                        $unwind: {
                          path: "$items.productDetails.hsn_detail",
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: "uoms",
                          let: { uomId: "$items.productDetails.weight.unit" },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $and: [
                                    { $eq: ["$_id", "$$uomId"] },
                                    { $eq: ["$isDeleted", false] },
                                  ],
                                },
                              },
                            },
                            {
                              $project: {
                                uom_type:1,
                                _id:0
                              },
                            },
                          ],
                          as: "items.productDetails.uomdetail"
                        }
                      },
                      {
                        $unwind: {
                          path: "$items.productDetails.uomdetail",
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $addFields: {
                          "items.totalQuantity": {
                            $multiply: [
                              "$items.noOfPacks",
                              "$items.productDetails.weight.quantityInPack"
                            ]
                          }
                        }
                      },
                      {
                        "$addFields": {
                          // Calculate gross tax for each item
                          "items.grossTax": {
                            "$multiply": [
                              "$items.totalAmount",
                              { "$divide": ["$items.taxAmount", 100] }
                            ]
                          }
                        }
                      },
                      {
                        "$addFields": {
                          // Calculate total amount including tax for each item
                          "items.totalAmountIncludingTax": {
                            "$add": [
                              "$items.totalAmount",
                              "$items.grossTax"
                            ]
                          }
                        }
                      },
                    {
                      $group: {
                        _id: "$_id",
                        gst: { $first: "$billing_address.primaryBillingAddress.billingCompanyDetail.gst.value" },
                        pan: { $first: "$billing_address.primaryBillingAddress.billingCompanyDetail.pan" },
                        type: { $first: "$type" },
                        primaryDetails: { $first: "$primaryDetails" },
                        items: { $push: "$items" },
                        terms: { $first: "$terms" },
                        paymentTerm: { $first: "$paymentTerm" },
                        status: { $first: "$status" },
                        isDeleted: { $first: "$isDeleted" },
                        sqNumber: { $first: "$documentNumber" },
                        createdBy: { $first: "$createdBy" },
                        updatedBy: { $first: "$updatedBy" },
                        deletedBy: { $first: "$deletedBy" },
                        billing_address: { $first: "$billing_address" },
                        shipping_address: { $first: "$shipping_address" },
                        // primaryBillingAddress: { $first: "$billing_address.primaryBillingAddress" },
                        // primaryShippingAddress: { $first: "$shipping_address.primaryShippingAddress" },
                        grossQuantity: { $sum: "$items.totalQuantity" },
                        grossPrice: { $sum: "$items.totalAmount" },
                        grossPacks: { $sum: "$items.noOfPacks" },
                       "totalAmountIncludingTax": { "$sum": "$items.totalAmountIncludingTax" },
                       "totalTax": { "$sum": "$items.grossTax" },
                        // "transportCost": { "$sum": { "$toDouble": "$primaryDetails.transportCost" } }
                      }
                    },
                    {
                      "$addFields": {
                        // Calculate grand total including transport cost
                        "grandTotal": {
                          "$add": [
                            "$totalAmountIncludingTax",
                            // "$transportCost"
                          ]
                        }
                      }
                    }
                  ]).then((qutationDetails)=>{
                    if(!qutationDetails){
                          throw{
                            statusCode:constants.code.dataNotFound,
                            message:constants.message.dataNotFound
                          }
                    }
                    else{
                           res.status(constants.code.success).json({
                            status:constants.code.success,
                            message:constants.message.success,
                            data:qutationDetails,
                           })
                    }
                  }).catch((err:any)=>{
                    res.status(err.statusCode).json({
                        status:constants.status.statusFalse,
                        message:err.message,
                        userStatus:req.status
                    })
                  })

                }
          })
    } catch (error) {
        res.status(constants.code.internalServerError).json({
            status:constants.status.statusFalse,
            message:error,
            userStatus:req.status
        })
    }
}

const createSalesQuotation=async(req:any,res:Response,next:NextFunction)=>{
    try {
        const documentNumber:any= await salesQuotationNumber();
            Address.findOne(
                {
                    _id:new mongoose.Types.ObjectId(req.body.billingAddressId),
                    isDeleted:false
                }
                )
            .then((sellerAddress)=>{
            if(!sellerAddress){
                throw{
                    statusCode:constants.code.dataNotFound,
                    message:message.addAddress
                }
           }
           else{
            Address.findOne({
                _id:new mongoose.Types.ObjectId(req.body.shippingAddressId),isDeleted:false
            }).then(async(buyerAddress)=>{
              if(!buyerAddress){
                throw{
                    statusCode:constants.code.dataNotFound,
                    message:message.buyerDetailsMissing
                }
              }
              else{
                Quotation.create({
                    documentNumber: documentNumber,
                    type: constants.quotationType.sales,
                    billingAddressId: new mongoose.Types.ObjectId(req.body.billingAddressId),
                    shippingAddressId: new mongoose.Types.ObjectId(req.body.shippingAddressId),
                    // primaryDetails:{
                    //     title: req.body.primaryDetails.title,
                    //     documentDate: req.body.primaryDetails.documentDate,
                    //     deliveryDate: req.body.primaryDetails.deliveryDate,
                    //     paymentTerm: req.body.primaryDetails.paymentTerm,
                    //     paymentDate: Date.now(),
                    // },
                    primaryDocumentDetails: {
                      documentDate: req.body.primaryDetails.documentDate,
                      documentNumber: await generateDocumentNumber(),
                      deliveryDate: req.body.primaryDetails.deliveryDate,
                      customerId: req.body.customerId,
                      contactPerson: req.body.purchase_officer,
                      paymentTerm:req.body.primaryDetails.paymentTerm,
                    },
                    items:req.body.items,
                    terms: req.body.terms,
                    paymentTerm:req.body.paymentTerm,
                    status:req.body.status,
                    createdBy:req?.id
                    }).then(async(savedQuotation:any)=>{
                      if(!savedQuotation){
                      throw{
                        statusCode:constants.code.dataNotFound,
                        message:message.quotationFailed
                      }
                      }
                      else{
                        await createQuotation(req.hostname, savedQuotation._id)
                        .then(async(quotationUrl)=>{
                         
                            if(!quotationUrl){
                                throw{
                                    statusCode:constants.code.dataNotFound,
                                    message:message.quotationPdfFailed
                                }
                            }
                            else{
                                // let fileName=quotationUrl.split(`files/`)[1]
                                // let pdfPath:any = `public/files/${fileName}`;
                                // let pdfData:any = readFileSync(pdfPath)

                               await Quotation.findOneAndUpdate(
                                 {
                                   _id: savedQuotation._id,
                                   isDeleted: false,
                                 },
                                 {
                                  url:quotationUrl
                                 },
                                 {new:true}
                               )
                                 .then(async (pdfStored) => {
                                   if (!pdfStored) {
                                     throw {
                                       statusCode: constants.code.dataNotFound,
                                       message: message.failedPdfStore,
                                     };
                                   } else {
                                     const fileName =
                                       quotationUrl.split("files/")[1];
                                     const pdfPath = path.join(
                                       process.cwd(),
                                       "public",
                                       "files",
                                       fileName
                                     );
                                     const pdfData = readFileSync(pdfPath);

                                     const payload = {
                                       // to: sellerAddress.email,
                                       to: `kinjalleua8@gmail.com`,
                                       title:
                                         constants.emailTitle.salesQuotation,
                                       data: { work: `work granted` },
                                       attachments: [
                                         {
                                           filename: "Quotation.pdf", // Name the PDF file as you want it to appear in the email
                                           content: pdfData,
                                           contentType: "application/pdf",
                                         },
                                       ],
                                     };
                                     await sendMail(payload);
                                     res.status(constants.code.success).json({
                                       status: constants.status.statusTrue,
                                       message: constants.message.success,
                                       userStatus: req.status,
                                     });
                                   }
                                 })
                                 .catch((err) => {
                                   res.status(err.statusCode).json({
                                     status: constants.status.statusFalse,
                                     message: err.message,
                                     userStatus: req.status,
                                   });
                                 });
                               const fileName = quotationUrl.split("files/")[1];
                               const pdfPath = path.join(
                                 process.cwd(),
                                 "public",
                                 "files",
                                 fileName
                               );
                               const pdfData = readFileSync(pdfPath);


                                // const payload = {
                                //     // to: sellerAddress.email,
                                //     to:`kinjalleua8@gmail.com`,
                                //     title: constants.emailTitle.salesQuotation,
                                //     data: {work:`work granted`},
                                //     attachments: [
                                //         {
                                //           filename: 'Quotation.pdf', // Name the PDF file as you want it to appear in the email
                                //           content: pdfData,
                                //           contentType: 'application/pdf'
                                //         }
                                //     ]
                                //   };
                                //   await sendMail(payload);
                                // res.status(constants.code.success).json({
                                //     status:constants.status.statusTrue,
                                //     message:constants.message.success,
                                //     userStatus:req.status
                                // })
                            }
                        }).catch((err)=>{
                            console.log("err3",err);
                            
                            res.status(err.statusCode).json({
                                status:constants.status.statusFalse,
                                message:err.message,
                                userStatus:req.status
                            })
                        })
                      }
                    }).catch((err)=>{
                        console.log("err2",err);
                        
                    res.status(constants.code.dataNotFound).json({
                        statusCode:constants.code.dataNotFound,
                        message:message.quotationFailed,
                        userStatus:req.status
                    })
                    })
              }
            }).catch((err)=>{
                console.log("err1",err);
                
                res.status(constants.code.dataNotFound).json(
                    {
                        status:constants.status.statusFalse,
                        message:message.AddressNotFound,
                    }
                )
            })
           }
        }).catch((err)=>{
            console.log("err",err);
            
            res.status(constants.code.dataNotFound).json({
                status:constants.status.statusFalse,
                userStatus:req.status,
                message:message.AddressNotFound,
            })
        })
    
    } catch (error) {
        console.log("error",error);
        
        res.status(constants.code.dataNotFound).json({
            status:constants.status.statusFalse,
            userStatus:req.status,
            message:error
        })
        
    }
}


const QuotationList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;
    const sort = req.query.sort === "desc" ? -1 : 1;

    let matchCondition = {
      isDeleted: false,
    };

    if (Number(req.query.limit) !== 0) {
      Quotation.aggregate([
        {
          $match: matchCondition,
        },
        {
          $lookup: {
            from: "addresses",
            localField: "billingAddressId",
            foreignField: "_id",
            as: "billing_address",
          },
        },
        {
          $unwind: {
            path: "$billing_address",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "companies",
            localField: "billing_address.companyId",
            foreignField: "_id",
            as: "company",
          },
        },
        {
          $unwind: {
            path: "$company",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdByData",
          },
        },
        {
          $unwind: {
            path: "$createdByData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            documentNumber: 1,
            companyName: "$company.name",
            status: 1,
            totalAmount: { $sum: "$items.totalAmount" },
            createdAt: 1,
            createdBy: {
              _id: "$createdByData._id",
              fname: "$createdByData.fname",
              lname: "$createdByData.lname",
            },
          },
        },
        {
          $sort: { createdAt: sort },
        },
        {
          $facet: {
            metadata: [
              { $count: "total" },
              { $addFields: { page: Number(page) } },
              {
                $addFields: {
                  totalPages: {
                    $ceil: { $divide: ["$total", limit] },
                  },
                },
              },
              {
                $addFields: {
                  hasPrevPage: {
                    $cond: {
                      if: {
                        $lt: [{ $subtract: [page, Number(1)] }, Number(0)],
                      },
                      then: false,
                      else: true,
                    },
                  },
                },
              },
              {
                $addFields: {
                  prevPage: {
                    $cond: {
                      if: {
                        $lt: [{ $subtract: [page, Number(1)] }, Number(0)],
                      },
                      then: null,
                      else: { $subtract: [page, Number(1)] },
                    },
                  },
                },
              },
              {
                $addFields: {
                  hasNextPage: {
                    $cond: {
                      if: {
                        $gt: [
                          {
                            $subtract: [
                              {
                                $ceil: { $divide: ["$total", limit] },
                              },
                              Number(1),
                            ],
                          },
                          "$page",
                        ],
                      },
                      then: true,
                      else: false,
                    },
                  },
                },
              },
              { $addFields: { nextPage: { $sum: [page, Number(1)] } } },
            ],
            data: [{ $skip: skip }, { $limit: limit }],
          },
        },
      ])
        .then((quotationList) => {
          if (!quotationList) {
            throw {
              statusCode: constants.code.dataNotFound,
              message: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              statusCode: constants.status.statusTrue,
              userStatus: req.status,
              data: quotationList,
            });
          }
        })
        .catch((err) => {
          res.status(err.statusCode).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: err.msg,
          });
        });
    } else {
      Quotation.aggregate([
        {
          $match: matchCondition,
        },
        {
          $lookup: {
            from: "addresses",
            localField: "billingAddressId",
            foreignField: "_id",
            as: "billing_address",
          },
        },
        {
          $unwind: {
            path: "$billing_address",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "companies",
            localField: "billing_address.companyId",
            foreignField: "_id",
            as: "company",
          },
        },
        {
          $unwind: {
            path: "$company",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdByData",
          },
        },
        {
          $unwind: {
            path: "$createdByData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            documentNumber: 1,
            companyName: "$company.name",
            status: 1,
            totalAmount: { $sum: "$items.totalAmount" },
            createdAt: 1,
            createdBy: {
              _id: "$createdByData._id",
              fname: "$createdByData.fname",
              lname: "$createdByData.lname",
            },
          },
        },
        {
          $sort: { createdAt: sort },
        },
        {
          $facet: {
            metadata: [
              { $count: "total" },
              { $addFields: { page: Number(page) } },
              {
                $addFields: { totalPages: { $sum: [Number(page), Number(1)] } },
              },
              { $addFields: { hasPrevPage: false } },
              { $addFields: { prevPage: null } },
              { $addFields: { hasNextPage: false } },
              { $addFields: { nextPage: null } },
            ],
            data: [],
          },
        },
      ])
        .then((quotationList) => {
          if (!quotationList) {
            throw {
              statusCode: constants.code.dataNotFound,
              message: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              statusCode: constants.status.statusTrue,
              userStatus: req.status,
              data: quotationList,
            });
          }
        })
        .catch((err) => {
          res.status(err.statusCode).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: err.msg,
          });
        });
    }
  } catch (error) {
    res.status(constants.code.badRequest).json({
      status: false,
      userStatus: req.statusCode,
      message: error,
    });
  }
};



export default {createSalesQuotation,getQuotationDetail,QuotationList}