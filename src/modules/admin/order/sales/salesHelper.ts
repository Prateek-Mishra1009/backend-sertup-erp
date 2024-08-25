import mongoose from "mongoose";
import Order from "../../../../models/order";
import Product from "../../../../models/product";
import constants from "../../../../utils/constants";
import { createStockAlert } from "../../../common/commonController";
import message from "./salesConstant";
import Invoice from "../../../../models/invoice";


export async function productDetailsOfOrder(orderNumber: any) {
  try {
    const data:any = await Invoice.aggregate([
      {
        $match: { orderNumber: orderNumber, signature:"$signature",  isDeleted: false },
      },
      {
        $lookup:{
          from:"orders",
          let : {orderNumber:"$orderNumber"},
          pipeline:[
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$orderNumber", "$$orderNumber"] },
                    { $eq: ["$isDeleted", false] },
                  ],
                },
              },
            },
            {
              $project:{
                _id:0,
                primaryDocumentDetails:1,
              }
            },
          ],
          
          as:"orderDetails"
        }
      },
      {
        $unwind:{
          path:"$orderDetails",
          preserveNullAndEmptyArrays:true
        }
      },
    
      {
        $lookup: {
          from: "addresses",
          let: { shippingAddress: "$shippingAddress" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$shippingAddress"] },
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
                name:1,
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
          as: "buyer_address", //to be changes as buyer address_details warehouse type
        },
      },
      {
        $unwind: {
          path: "$buyer_address",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "addresses",
          let: { supplierAddress: "$supplierAddress" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$supplierAddress"] },
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
                gst: 1,
              },
            },
          ],
          as: "supplier_address",
        },
      },
      {
        $unwind: {
          path: "$supplier_address",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "addresses",
          let: { companyId: "$supplier_address.companyId" },
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
                name:1,
                address: 1,
                phone: 1,
                email: 1,
                companyId:1,
                landmark: 1,
                city: "$city_info.name",
                state: "$state_info.name",
                country: "$country_info.name",
                gst:1
              },
            },
          ],
          as: "supplier_address.primaryAddress",
        },
      },
      {
        $unwind: {
          path: "$supplier_address.primaryAddress",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "addresses",
          let: { companyId: "$buyer_address.companyId" },
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
                gst:1,
              },
            },
          ],
          as: "buyer_address.primaryAddress",
        },
      },
      {
        $unwind: {
          path: "$buyer_address.primaryAddress",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "companies",
          let: { companyId: "$buyer_address.primaryAddress.companyId"},
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
          as: "buyer_address.primaryAddress.buyerCompanyDetail",
        },
      },
   
      {
        $unwind: {
          path: "$buyer_address.primaryAddress.buyerCompanyDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
   
      {
        $lookup: {
          from: "companies",
          let: { companyId: "$shipping_address.primaryAddress.companyId"},
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
              },
            },
          ],
          as: "supplier_address.primaryAddress.companyDetail",
        },
      },
   
      {
        $unwind: {
          path: "$supplier_address.primaryAddress.companyDetail",
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
        gst: { $first: "$supplier_address.primaryAddress.companyDetail.gst.value" },
        pan: { $first: "$supplier_address.primaryAddress.companyDetail.pan" },
        type: { $first: "$type" },
        primaryDetails: { $first: "$orderDetails.primaryDocumentDetails" },
        items: { $push: "$items" },
        terms: { $first: "$terms" },
        signature: { $first: "$signature" },
        paymentTerm: { $first: "$paymentTerm" },
        status: { $first: "$status" },
        isDeleted: { $first: "$isDeleted" },
        sqNumber: { $first: "$documentNumber" },
        createdBy: { $first: "$createdBy" },
        updatedBy: { $first: "$updatedBy" },
        deletedBy: { $first: "$deletedBy" },
        buyer_address: { $first: "$buyer_address" },
        supplier_address: { $first: "$supplier_address" },
        buyerPrimaryAddress: { $first: "$buyer_address.primaryAddress" },
        supplierPrimaryAddress: { $first: "$supplier_address.primaryAddress" },
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
      ])
      return data[0];
  } catch (error) {
    console.log(error)
  }
}


export async function getSalesOrderDetails(orderNumber: string, req: any) {
  const purchaseOrderDetails: any = await Order.aggregate([{ $match: { orderNumber: orderNumber,isDeleted:false } }]);
  if (!purchaseOrderDetails) {
    throw {
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: `${orderNumber} ${message.purchaseOrderNumberNotFound}`,
    };
  }
  return purchaseOrderDetails[0];
}
 export async function getLatestSellingPrice(productId:any) {
  try {
    // Find the latest order based on `createdAt`
    const latestOrder :any= await Order.findOne({})
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .exec();

    if (!latestOrder) {
      return 0
    }

    // Find the item with the specified productId in the latest order
    const item:any = latestOrder.items.find(
      (item:any) => item.productId.toString() === productId
    );

    if (!item) {
      Product.findOne({
        _id: new mongoose.Types.ObjectId(productId),
        isDeleted:false
      }).then((item)=>{
        if(!item){
          return 0;
        }
        else{
          return  item.price?.sellingPrice
        }
      })
    }

    return item.sellingPrice;
  } catch (error) {
    return null; // Or handle the error as needed
  }
}

export async function sendForApproval(items: any[]): Promise<boolean> {
  let approvalNeeded = false;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    const data:any = await Product.findOne({
      _id: new mongoose.Types.ObjectId(item.productId),
      isDeleted: false
    });

    if (data && data.price.costPrice > item.sellingPrice) {
      approvalNeeded = true;
      break; // Exit the loop early if approval is needed
    }
  }

  return approvalNeeded;
}

export async function checkStock(items:any){
try{
  for (let i = 0; items.length; i++) {
    //  await createStockAlert(req.body.items[i].productId,req.body.items[i].quantity);
    let productDetail: any = await Product.findOne({
      _id: new mongoose.Types.ObjectId(items[i].productId),
      isDeleted: false,
    });
    let quantity: any =
      Number(productDetail?.weight?.quantityInPack) *
      Number(items[i].noOfPacks);
    await createStockAlert(items[i].productId, quantity);
  }
  return true
}
catch(error){
  return false
}
}