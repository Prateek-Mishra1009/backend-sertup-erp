import { readFileSync, writeFileSync } from "fs";
import Handlebars from "handlebars";
import puppeteer from "puppeteer";
import { decryptMsg, fileUrl, numberToWord } from "./helper";
import Quotation from "../models/quotation";
import constants from "../utils/constants";

const generateHtml = async (quotationId: string) => {
  const data: any = await Quotation.aggregate([
    {
      $match: { _id: quotationId, isDeleted: false },
    },
    
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
      primaryBillingAddress: { $first: "$billing_address.primaryBillingAddress" },
      primaryShippingAddress: { $first: "$shipping_address.primaryShippingAddress" },
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
 

 
  const context = {
    data: data[0],
      // additionalInfoHtml:terms
    // pan: await decryptMsg(
    //   data[0].seller_detail.pan,
    //   data[0].seller_detail.userId.toString()
    // ),
    // gst: await decryptMsg(
    //   data[0].seller_detail.gst,
    //   data[0].seller_detail.userId.toString()
    // ),
    // amountInWords: (await numberToWord(Number(data[0].subTotal))).toUpperCase(),
  };
 
  // console.log(context);
  
  const content = readFileSync("public/templates/salesQuotation.html", "utf8");

  
 
  const template = Handlebars.compile(content);
 
  Handlebars.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
  });

   Handlebars.registerHelper('formatDate', function(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = String(date.getFullYear()) 
    return `${day}-${month}-${year}`;
  });

  Handlebars.registerHelper("inc", function(value, options) {
    return parseInt(value) + 1;
  });

 
  return template(context);
};

const createQuotation = async (host: string, quotationId: string) => {
  const html: any = await generateHtml(quotationId);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.emulateMediaType("screen");
  const file = await page.pdf({ printBackground: true, format: "A4" });
  await browser.close();

  const filename = `quotation-${Date.now()}.pdf`;
  writeFileSync(`public/files/${filename}`, file, "base64");
  return fileUrl(host, filename);
};

export default createQuotation;
