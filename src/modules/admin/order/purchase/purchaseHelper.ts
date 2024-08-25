import Invoice from "../../../../models/invoice";
import Order from "../../../../models/order";
import constants from "../../../../utils/constants";
import message from "./purchaseOrderConstant";

export async function productDetailsOfOrder(orderNumber: any) {
  const data: any = await Invoice.aggregate([
    { $match: { orderNumber: orderNumber, isDeleted: false } },
    { $project: { orderNumber: "$orderNumber", signature: "$signature", _id: 0 } },
    {
      $lookup: {
        from: "orders",
        localField: "orderNumber",
        foreignField: "orderNumber",
        let: { purchaseOrderId: "$orderNumber" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$orderNumber", "$$purchaseOrderId"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              orderNumber: 1,
              orderType: 1,
              soldBy: 1,
              orderBy: 1,
              extraCharge: 1,
              goodStatus: 1,
              status: 1,
              orderDate: 1,
              shippingAddress: 1,
              supplierAddress: 1,
              items: 1,
              subtotal: 1,
              taxes: 1,
              grandTotal: 1,
              primaryDocumentDetails: 1,
              comment: 1,
              isDeleted: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        as: "order_Details",
      },
    },
    { $unwind: "$order_Details" },
    {
      $lookup: {
        from: "addresses",
        let: { supplierAddress_id: "$order_Details.supplierAddress" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$supplierAddress_id"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              address: 1,
              _id: 0,
              companyId: 1,
              email: 1,
              phone: 1,
              name: 1,
            },
          },
        ],
        as: "supplierDetails",
      },
    },
    {
      $unwind: {
        path: "$supplierDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "addresses",
        let: { shippingAddress_id: "$order_Details.shippingAddress" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$shippingAddress_id"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              address: 1,
              _id: 0,
              companyId: 1,
              email: 1,
              phone: 1,
              name: 1,
            },
          },
        ],
        as: "shippingDetails",
      },
    },
    {
      $unwind: {
        path: "$shippingDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "addresses",
        let: { shipping_companyId: "$shippingDetails.companyId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$companyId", "$$shipping_companyId"] },
                  { $eq: ["$type", constants.addressTypes.work] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              address: 1,
              _id: 0,
              companyId: 1,
              email: 1,
              phone: 1,
              name: 1,
            },
          },
        ],
        as: "primary_shipping_Details",
      },
    },
    {
      $unwind: {
        path: "$primary_shipping_Details",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "companies",
        let: { company_id: "$shippingDetails.companyId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$company_id"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              name: 1,
              "gst.value": 1,
              "pan.value": 1,
              _id: 0,
            },
          },
        ],
        as: "buyer_company_data",
      },
    },
    {
      $unwind: {
        path: "$buyer_company_data",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "companies",
        let: { company_id: "$supplierDetails.companyId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$company_id"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              name: 1,
              "gst.value": 1,
              _id: 0,
              "pan.value": 1,
            },
          },
        ],
        as: "supplier_company_data",
      },
    },
    {
      $unwind: {
        path: "$supplier_company_data",
        preserveNullAndEmptyArrays: true,
      },
    },
    { $unwind: "$order_Details.items" },
    {
      $lookup: {
        from: "uoms",
        let: { unitId: "$order_Details.items.unit" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$unitId"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              uom_type: 1,
            },
          },
        ],
        as: "unitData",
      },
    },
    { $unwind: "$unitData" },
    {
      $lookup: {
        from: "products",
        let: { productId: "$order_Details.items.productId" },
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
          {
            $project: {
              _id: 0,
              sku: 1,
              name: 1,
              weight: 1,
            },
          },
        ],
        as: "productData",
      },
    },
    { $unwind: "$productData" },
    {
      $lookup: {
        from: "countries",
        let: { countryId: "$supplierDetails.address.country" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$countryId"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
            },
          },
        ],
        as: "supplierDetails_countryData",
      },
    },
    { $unwind: "$supplierDetails_countryData" },
    {
      $lookup: {
        from: "countries",
        let: { countryId: "$shippingDetails.address.country" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$countryId"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
            },
          },
        ],
        as: "shippingDetails_countryData",
      },
    },
    { $unwind: "$shippingDetails_countryData" },
    {
      $lookup: {
        from: "countries",
        let: { countryId: "$primary_shipping_Details.address.country" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$countryId"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
            },
          },
        ],
        as: "primary_shipping_details_countryData",
      },
    },
    { $unwind: "$primary_shipping_details_countryData" },
    {
      $lookup: {
        from: "states",
        let: { stateId: "$shippingDetails.address.state" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$stateId"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
            },
          },
        ],
        as: "shippingDetails_stateData",
      },
    },
    { $unwind: "$shippingDetails_stateData" },
    {
      $lookup: {
        from: "states",
        let: { stateId: "$primary_shipping_Details.address.state" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$stateId"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
            },
          },
        ],
        as: "primary_shipping_details_stateData",
      },
    },
    { $unwind: "$primary_shipping_details_stateData" },
    {
      $lookup: {
        from: "states",
        let: { stateId: "$supplierDetails.address.state" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$stateId"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
            },
          },
        ],
        as: "supplierDetails_stateData",
      },
    },
    { $unwind: "$supplierDetails_stateData" },
    {
      $lookup: {
        from: "cities",
        let: { cityId: "$shippingDetails.address.city" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$cityId"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
            },
          },
        ],
        as: "shippingDetails_cityData",
      },
    },
    { $unwind: "$shippingDetails_cityData" },
    {
      $lookup: {
        from: "cities",
        let: { cityId: "$primary_shipping_Details.address.city" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$cityId"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
            },
          },
        ],
        as: "primary_shipping_details_cityData",
      },
    },
    { $unwind: "$primary_shipping_details_cityData" },
    {
      $lookup: {
        from: "cities",
        let: { cityId: "$supplierDetails.address.city" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$cityId"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
            },
          },
        ],
        as: "supplierDetails_cityData",
      },
    },
    { $unwind: "$supplierDetails_cityData" },
    {
      $lookup: {
        from: "hsns",
        let: { hsnId: "$order_Details.items.hsn" },
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
              _id: 0,
              hsn: 1,
            },
          },
        ],
        as: "hsnDetails",
      },
    },
    { $unwind: "$hsnDetails" },
    {
      $addFields: {
        "supplierDetails.address.countryName": "$supplierDetails_countryData.name",
        "shippingDetails.address.countryName": "$shippingDetails_countryData.name",
        "supplierDetails.address.stateName": "$supplierDetails_stateData.name",
        "shippingDetails.address.stateName": "$shippingDetails_stateData.name",
        "supplierDetails.address.cityName": "$supplierDetails_cityData.name",
        "shippingDetails.address.cityName": "$shippingDetails_cityData.name",
        "primary_shipping_Details.address.countryName": "$primary_shipping_details_countryData.name",
        "primary_shipping_Details.address.stateName": "$primary_shipping_details_stateData.name",
        "primary_shipping_Details.address.cityName": "$primary_shipping_details_cityData.name",
        "order_Details.items.unitData": "$unitData",
        "order_Details.items.name": "$productData.name",
        "order_Details.items.sku": "$productData.sku",
        "order_Details.items.hsn": "$hsnDetails.hsn",
        "order_Details.items.quantityInPack": "$productData.weight.quantityInPack",
        "order_Details.items.totalQuantity": { $round: [{ $multiply: ["$order_Details.items.noOfPacks", "$productData.weight.quantityInPack"] }, 0] },
        "order_Details.grandTotal": { $round: [{ $sum: ["$order_Details.taxes", "$order_Details.subtotal"] }, 0] },
        "order_Details.totalPacks": { $sum: ["$order_Details.items.noOfPacks"] }
      },
    },
    {
      $group: {
        _id: "$order_Details._id",
        orderNumber: { $first: "$orderNumber" },
        signature: { $first: "$signature" },
        subtotal: { $first: { $round: ["$order_Details.subtotal", 0] } },
        totalPacks: { $sum: "$order_Details.items.noOfPacks" },
        grandQuantity: { $sum: "$order_Details.items.totalQuantity" },
        taxes: { $first: { $round: ["$order_Details.taxes", 0] } },
        grandTotal: { $first: { $round: ["$order_Details.grandTotal", 0] } },
        comment: { $first: "$order_Details.comment" },
        supplier_gst: { $first: "$supplier_company_data.gst.value" },
        buyer_gst: { $first: "$buyer_company_data.gst.value" },
        supplier_pan: { $first: "$supplier_company_data.pan.value" },
        buyer_pan: { $first: "$buyer_company_data.pan.value" },
        type: { $first: "$order_Details.orderType" },
        primaryDetails: { $first: "$order_Details.primaryDocumentDetails" },
        items: { $push: "$order_Details.items" },
        status: { $first: "$order_Details.status" },
        isDeleted: { $first: "$order_Details.isDeleted" },
        createdAt: { $first: "$order_Details.createdAt" },
        updatedAt: { $first: "$order_Details.updatedAt" },
        supplierAddress: { $first: "$order_Details.supplierAddress" },
        shippingDetails: { $first: "$shippingDetails" },
        supplierDetails: { $first: "$supplierDetails" },
        primary_shipping_Details: { $first: "$primary_shipping_Details" },
      },
    },
  ]);

  return data[0];
}

export async function getPurchaseOrderDetails(orderNumber: string, req: any) {
  const purchaseOrderDetails: any = await Order.aggregate([{ $match: { orderNumber: orderNumber } }]);
  if (!purchaseOrderDetails) {
    throw {
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: `${orderNumber} ${message.purchaseOrderNumberNotFound}`,
    };
  }
  return purchaseOrderDetails[0];
}


export async function updateOverAllStatusOfPurchaseOrder(req: any, res: any) {
  try {
 
    await Order.findOneAndUpdate(
      { orderNumber: req.body.orderNumber }, // Match the document
      [
        {
          $set: {
            status: {
              $switch: {
                branches: [
                  {
                    case: {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: "$items",
                              as: "item",
                              cond: {
                                $eq: [
                                  "$$item.status.orderStatus",
                                  constants.orderStatus.partiallyDelivered,
                                ],
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    then: constants.orderStatus.partiallyDelivered,
                  },
                  {
                    case: {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: "$items",
                              as: "item",
                              cond: {
                                $eq: [
                                  "$$item.status.orderStatus",
                                  constants.orderStatus.partialllyShipped,
                                ],
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    then: constants.orderStatus.partialllyShipped,
                  },
                  {
                    case: {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: "$items",
                              as: "item",
                              cond: {
                                $eq: [
                                  "$$item.status.orderStatus",
                                  constants.orderStatus.partialllyShipped,
                                ],
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    then: constants.orderStatus.partialllyShipped,
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $size: {
                            $filter: {
                              input: "$items",
                              as: "item",
                              cond: {
                                $ne: [
                                  "$$item.status.orderStatus",
                                  constants.orderStatus.delivered,
                                ],
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    then: constants.orderStatus.delivered,
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $size: {
                            $filter: {
                              input: "$items",
                              as: "item",
                              cond: {
                                $ne: [
                                  "$$item.status.orderStatus",
                                  constants.orderStatus.shipped,
                                ],
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    then: constants.orderStatus.shipped,
                  },
                  {
                    case: {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: "$items",
                              as: "item",
                              cond: {
                                $ne: [
                                  "$$item.status.orderStatus",
                                  constants.orderStatus.completed,
                                ],
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    then: constants.orderStatus.completed,
                  },
                ],
                default: '$status',
              },
            },
          },
        },
      ]
    ).then((updatedData) => {
      if (!updatedData) {
        throw {
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: message.statusUpdateError,
        };
      }
      res.status(constants.code.success).json({
        statusCode: constants.code.success,
        userStatus: req.status,
        message: message.orderStatus,
      });
    })
      .catch((error) => {
        res.status(constants.code.preconditionFailed).json({
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: error,
        });
      });
  } catch (error) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
}

export async function updateOverAllStatusOfPurchaseReturn(req: any, res: any) {
  try {
    await Order.findOneAndUpdate(
      { orderNumber: req.body.orderId }, // Match the document
      [
        {
          $set: {
            status: {
              $switch: {
                branches: [
                  {
                    case: {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: "$items",
                              as: "item",
                              cond: {
                                $eq: [
                                  "$$item.status.orderStatus",
                                  constants.orderStatus.partialllyShipped,
                                ],
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    then: constants.orderStatus.partialllyShipped,
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $size: {
                            $filter: {
                              input: "$items",
                              as: "item",
                              cond: {
                                $ne: [
                                  "$$item.status.orderStatus",
                                  constants.orderStatus.shipped,
                                ],
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    then: constants.orderStatus.shipped,
                  },
                ],
                default: req.body.status,
              },
            },
          },
        },
      ]
    )
      .then((updatedData) => {
        if (!updatedData) {
          throw {
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: message.statusUpdateError,
          };
        }
        res.status(constants.code.success).json({
          statusCode: constants.code.success,
          userStatus: req.status,
          message: message.orderStatus,
        });
      })
      .catch((error) => {
        res.status(constants.code.preconditionFailed).json({
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: error,
        });
      });
  } catch (error) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
}


export default { getPurchaseOrderDetails, productDetailsOfOrder, updateOverAllStatusOfPurchaseOrder, updateOverAllStatusOfPurchaseReturn }