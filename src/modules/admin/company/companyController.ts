import excelToJson from "convert-excel-to-json";
import { NextFunction, Response, Request } from "express";
import {
  createSlug,
  generateAddressSlug,
  getFileName,
  getPanFromGst,
  getPinDetail,
  logoUrl,
  phoneFormat,
  photoUrl,
  removeFile,
  removeLogo,
  removePhoto,
  toLowerCase,
  validateExcelColumns,
} from "../../../helpers/helper";
import constants from "../../../utils/constants";
import Company from "../../../models/company";
import message from "./companyConstant";
import mongoose from "mongoose";
import Address from "../../../models/address";
import User from "../../../models/user";
import { fork } from "node:child_process";
import { spawn } from 'child_process';
import path from "node:path";

// const addCompanyBulk = async (req: any, res: Response, next: NextFunction) => {
//   try {
//     let createdBy = req?.id;
//     const data = excelToJson({
//       sourceFile: req.file.path,
//       sheets: ["companies"],
//       sheetStubs: true
//     });

//     const selfCompanyDetail=await Company.findOne({isCompanyErp:true,isDeleted:false})
//     if(!selfCompanyDetail){
//       throw{
//         statusCode:constants.code.dataNotFound,
//         message:message.selfCompanyNotFound
//       }
//     }

//     const columns: any = [
//       "Name",
//       "Company Type",
//       "Business Type",
//       "GST Type",
//       "GST Number",
//       "Email",
//       "Phone",
//       "Mobile",
//       "Address Line 1",
//       "Address Line 2",
//       "City",
//       "Zip Code",
//       "State",
//       "Area",
//       "Contact Person Name 1",
//       "Contact Person Phone 1",
//       "Contact Person Email 1",
//       "Contact Person Name 2",
//       "Contact Person Phone 2",
//       "Contact Person Email 2",
//     ];
//     const excelData = await validateExcelColumns(columns, data["companies"]);
//     excelData.shift();
//     excelData.sort((a: any, b: any) => {
//       if ((a["Company Type"]) && (b["Company Type"])) {
//         a["Company Type"].localeCompare(b["Company Type"])
//       }
//     }
//     );

//     for (let index = 0; index < excelData.length; index++) {
//       const element = excelData[index];
//       let pinCode: any = Object.values(element)[11];
//       let pindata: any = await getPinDetail(`${pinCode}`);
//       const name: any = Object.values(element)[0];
//       // if (!pindata) {
//       //   console.log(index + `does not have correct pin`, `${pinCode}`)
//       // }
//       if (pinCode == null) {
//         pinCode = `222302`,
//           pindata = await getPinDetail(pinCode)
//       }

//       if (
//         !Object.values(element)[4] ||
//         !pindata
//       ) {

//         // console.log( !Object.values(element)[4] ,!Object.values(element)[5])
//         // console.log('skipping index',index)
//         continue;
//       } else {
//         let typeValue:any=Object.values(element)[1] ;
//         if (typeValue&&typeValue.toLowerCase() === constants.companyCategory.company) {
//           await Company.findOneAndUpdate(
//             {
//               $and: [
//                 {
//                   "gst.value": Object.values(element)[4],
//                    isCompanyErp: { $ne: true },
//                   "companyEmail.value": Object.values(element)[5],
//                   name: name,
//                   companyType: constants.companyCategory.company,
//                   isDeleted: false,
//                 },
//               ],
//             },
//             {
//               gstType: Object.values(element)[3],
//               companyType: Object.values(element)[1],
//               reference_id: "",
//               "companyEmail.value": Object.values(element)[5],
//               "companyPhone.value": await phoneFormat(
//                 Object.values(element)[6]
//               ),
//               foundingYear: 2022,
//               buyerAndSupplier: Object.values(element)[2],
//               "gst.value": Object.values(element)[4],
//               // contactPersonName: Object.values(element)[14],
//               // "contactPhone.value": await phoneFormat(
//               //   Object.values(element)[15]
//               // ),
//                 contactPerson:{
//                 name: Object.values(element)[14],
//                 phone: Object.values(element)[15],
//                 email: Object.values(element)[16],
//                 },
           
//               // "contactPersonTwo.name": Object.values(element)[17],
//               // "contactPersonTwo.phone": Object.values(element)[18],
//               // "contactPersonTwo.email": Object.values(element)[19],
//               pan: {
//                 value: await getPanFromGst(Object.values(element)[4])
//               },
//               createdBy: new mongoose.Types.ObjectId(req?.id),
//               updatedBy: new mongoose.Types.ObjectId(req?.id),
//               isDeleted: false,
//             },
//             { new: true, upsert: true }
//           )
//             .then(async (companyData: any) => {
//               if (!companyData) {
//                 throw {
//                   statusCode: constants.code.badRequest,
//                   message: message.updateFailed,
//                 };
//               } else {
//                 await Address.findOneAndUpdate(
//                   {
//                     $and: [
//                       { companyId: companyData._id },
//                       { companyId: { $nin: selfCompanyDetail._id } },
//                       { email: companyData.companyEmail.value },
//                       { isDeleted: false }
//                     ]
//                   },
//                   {
//                     companyId: companyData._id,
//                     slug: await generateAddressSlug(
//                       name,
//                       constants.addressTypes.work,
//                       pinCode
//                     ),
//                     name: name,
//                     constraint: constants.constraint.primary,
//                     type:
//                       companyData.companyType == constants.constraint.primary
//                         ? constants.addressTypes.work
//                         : constants.addressTypes.warehouse,
//                     email: companyData.companyEmail.value,
//                     phone: await phoneFormat(companyData.companyPhone.value),
//                     "address.line_one": Object.values(element)[8],
//                     "address.line_two": Object.values(element)[9],
//                     "address.city": new mongoose.Types.ObjectId(pindata.cityId),
//                     "address.state": new mongoose.Types.ObjectId(
//                       pindata.stateId
//                     ),
//                     "address.country": new mongoose.Types.ObjectId(
//                       pindata.countryId
//                     ),
//                     "address.pin_code": pinCode.toString(),
//                     isDeleted: false,
//                     createdBy: new mongoose.Types.ObjectId(req?.id),
//                     updatedBy: new mongoose.Types.ObjectId(req?.id),
//                   },
//                   { upsert: true, new: true }
//                 )
//                   .then((data) => {
//                     if (!data) {
//                       throw {
//                         statusCode: constants.code.dataNotFound,
//                         message: constants.message.dataNotFound,
//                       };
//                     }
//                   })
//                   .catch((err) => {
//                     console.log("err", err);

//                     return res.status(err.statusCode).json({
//                       status: constants.status.statusFalse,
//                       userStatus: req.status,
//                       message: err.message,
//                     });
//                   });
//               }
//             })
//             .catch((err) => {
//               console.log("err1", err);

//               return res.status(err.statusCode).json({
//                 status: constants.status.statusFalse,
//                 userStatus: req.status,
//                 message: err.message,
//               });
//             });
//         } else if (typeValue&&
//           typeValue.toLowerCase()=== constants.companyCategory.individual
//         ) {
//           const findCompanyWithCompanyTypeCompany = await Company.exists({
//             companyType: constants.companyCategory.individual,
//             "gst.value": Object.values(element)[4],
//             isDeleted: false,
//           });
//           if (findCompanyWithCompanyTypeCompany) {
//             await Company.findOne({
//               companyType: constants.companyCategory.individual,
//               "gst.value": Object.values(element)[4],
//               isDeleted: false,
//             })
//               .then(async (companyData: any) => {
//                 if (!companyData) {
//                   throw {
//                     statusCode: constants.code.badRequest,
//                     message: message.updateFailed,
//                   };
//                 } else {
//                   const existedAddress = await Address.findOne(
//                     { name: name, 
//                       companyId: companyData._id 
//                      }
//                   )
//                   if (existedAddress) {
//                     await Address.updateOne(
//                       {
//                         companyId: companyData._id ,
//                         slug: await generateAddressSlug(
//                           name,
//                           constants.addressTypes.warehouse,
//                           pinCode
//                         ),
//                         name: name,
//                         constraint: constants.constraint.secondary,
//                         type:
//                           companyData.companyType == constants.constraint.primary
//                             ? constants.addressTypes.work
//                             : constants.addressTypes.warehouse,
//                         email: companyData.companyEmail.value,
//                         phone: await phoneFormat(companyData.companyPhone.value),
//                         "address.line_one": Object.values(element)[8],
//                         "address.line_two": Object.values(element)[9],
//                         "address.city": new mongoose.Types.ObjectId(
//                           pindata.cityId
//                         ),
//                         "address.state": new mongoose.Types.ObjectId(
//                           pindata.stateId
//                         ),
//                         "address.country": new mongoose.Types.ObjectId(
//                           pindata.countryId
//                         ),
//                         "address.pin_code": pinCode.toString(),
//                         isDeleted: false,
//                         createdBy: new mongoose.Types.ObjectId(req?.id),
//                         updatedBy: new mongoose.Types.ObjectId(req?.id),
//                       },
//                     ).then((updatedAddress) => {
//                       if (!updatedAddress) {
//                         throw {
//                           statusCode: constants.code.dataNotFound,
//                           message: constants.message.dataNotFound,
//                         };
//                       }
//                     }).
//                       catch((err) => {
//                         console.log("err111", err);

//                         return res.status(err.statusCode).json({
//                           status: constants.status.statusFalse,
//                           userStatus: req.status,
//                           message: err.message,
//                         });
//                       })
//                   }

//                 }
//               })
//               .catch((err) => {
//                 console.log("err2", err);

//                 return res.status(err.statusCode).json({
//                   status: constants.status.statusFalse,
//                   userStatus: req.status,
//                   message: err.message,
//                 });
//               });
//           } else {
//             await Company.create({
//               name: name,
//               companyType: constants.companyCategory.individual,
//               gstType: Object.values(element)[3],
//               reference_id: "",
//               "companyEmail.value": Object.values(element)[5],
//               "companyPhone.value": await phoneFormat(
//                 Object.values(element)[6]
//               ),
//               foundingYear: 2022,
//               buyerAndSupplier: Object.values(element)[2],
//               "gst.value": Object.values(element)[4],
//               // contactPersonName: Object.values(element)[14],
//               // "contactPhone.value": await phoneFormat(
//               //   Object.values(element)[15]
//               // ),

//                 contactPerson:{
//                 name: Object.values(element)[14],
//                 phone: Object.values(element)[15],
//                email: Object.values(element)[16],
//                 },
 
//               // "contactEmail.value": Object.values(element)[14],
//               // "contactPersonOne.name": Object.values(element)[14],
//               // "contactPersonOne.phone": Object.values(element)[15],
//               // "contactPersonOne.email": Object.values(element)[16],
//               // "contactPersonTwo.name": Object.values(element)[17],
//               // "contactPersonTwo.phone": Object.values(element)[18],
//               // "contactPersonTwo.email": Object.values(element)[19],
//               pan: {
//                 value: await getPanFromGst(Object.values(element)[4])
//               },
//               createdBy: new mongoose.Types.ObjectId(req?.id),
//               updatedBy: new mongoose.Types.ObjectId(req?.id),
//               isDeleted: false,
//             })
//               .then(async (companyData: any) => {
//                 if (!companyData) {
//                   throw {
//                     statusCode: constants.code.badRequest,
//                     message: message.updateFailed,
//                   };
//                 } else {
//                   await Address.create(
//                     {
//                       companyId: companyData._id,
//                       slug: await generateAddressSlug(
//                         name,
//                         constants.addressTypes.warehouse,
//                         pinCode
//                       ),
//                       name: name,
//                       constraint: constants.constraint.primary,
//                       type:
//                         companyData.CompanyType == constants.constraint.primary
//                           ? constants.addressTypes.work
//                           : constants.addressTypes.warehouse,
//                       email: companyData.companyEmail.value,
//                       phone: await phoneFormat(companyData.companyPhone.value),
//                       "address.line_one": Object.values(element)[8],
//                       "address.line_two": Object.values(element)[9],
//                       "address.city": pindata.cityId,
//                       "address.state": pindata.stateId,
//                       "address.country": pindata.countryId,
//                       "address.pin_code": pinCode.toString(),
//                       isDeleted: false,
//                       createdBy: new mongoose.Types.ObjectId(req?.id),
//                       updatedBy: new mongoose.Types.ObjectId(req?.id),
//                     }
//                   )
//                     .then((updatedAddress) => {
//                       if (!updatedAddress) {
//                         throw {
//                           statusCode: constants.code.dataNotFound,
//                           message: constants.message.dataNotFound,
//                         };
//                       }
//                     })
//                     .catch((err) => {
//                       console.log("err3", err);

//                       res.status(constants.code.preconditionFailed).json({
//                         status: constants.status.statusFalse,
//                         userStatus: req.status,
//                         message: err.message ? err.message : err,
//                       });
//                     });
//                 }
//               })
//               .catch((err) => {
//                 console.log("err4", err);

//                 res.status(constants.code.preconditionFailed).json({
//                   status: constants.status.statusFalse,
//                   userStatus: req.status,
//                   message: err.message ? err.message : err,
//                 });
//               });
//           }
//         }
//       }
//     }
//     await removeFile(req.file.filename);
//     return res.status(constants.code.success).json({
//       status: constants.status.statusTrue,
//       userStatus: req.status,
//       message: message.bulkCompanyUpload,
//     });
//   } catch (error: any) {
//     console.log("errorr", error);

//     res.status(constants.code.preconditionFailed).json({
//       status: constants.status.statusFalse,
//       userStatus: req.status,
//       message: error.message ? error.message : error,
//     });
//   }
// };


const addCompanyBulk = async (req: any, res: Response, next: NextFunction) => {
  try {
    let createdBy = req?.id;
    const data = excelToJson({
      sourceFile: req.file.path,
      sheets: ["companies"],
      sheetStubs: true
    });

    const columns: any = [
      "Name",
      "Company Type",
      "Business Type",
      "GST Type",
      "GST Number",
      "Email",
      "Phone",
      "Mobile",
      "Address Line 1",
      "Address Line 2",
      "City",
      "Zip Code",
      "State",
      "Area",
      "Contact Person Name 1",
      "Contact Person Phone 1",
      "Contact Person Email 1",
      "Contact Person Name 2",
      "Contact Person Phone 2",
      "Contact Person Email 2",
    ];
    const excelData = await validateExcelColumns(columns, data["companies"]);
    excelData.shift();
    excelData.sort((a: any, b: any) => {
      if (a["Company Type"] && b["Company Type"]) {
        return a["Company Type"].localeCompare(b["Company Type"]);
      }
      return 0;
    });

    for (let index = 0; index < excelData.length; index++) {
      const element = excelData[index];
      let pinCode: any = Object.values(element)[11];
      let pindata: any = await getPinDetail(`${pinCode}`);
      const name: any = Object.values(element)[0];

      if (pinCode == null) {
        pinCode = `222302`;
        pindata = await getPinDetail(pinCode);
      }

      if (!Object.values(element)[4] || !pindata) {
        continue;
      } else {
        const companyType = Object.values(element)[1];
        const gstValue = Object.values(element)[4];
        const companyEmail = Object.values(element)[5];
        
        if (companyType === constants.companyCategory.company) {
          const companyData:any = await Company.findOneAndUpdate(
            {
              $and: [
                { "gst.value": gstValue },
                { "companyEmail.value": companyEmail },
                { name: name },
                { companyType: constants.companyCategory.company },
                { isDeleted: false }
              ]
            },
            {
              gstType: Object.values(element)[3],
              companyType: companyType,
              reference_id: "",
              "companyEmail.value": companyEmail,
              "companyPhone.value": await phoneFormat(Object.values(element)[6]),
              foundingYear: 2022,
              buyerAndSupplier: Object.values(element)[2],
              "gst.value": gstValue,
              contactPerson: {
                name: Object.values(element)[14],
                phone: Object.values(element)[15],
                email: Object.values(element)[16]
              },
              pan: {
                value: await getPanFromGst(gstValue)
              },
              createdBy: new mongoose.Types.ObjectId(req?.id),
              updatedBy: new mongoose.Types.ObjectId(req?.id),
              isDeleted: false
            },
            { new: true, upsert: true }
          );

          if (!companyData) {
            throw {
              statusCode: constants.code.badRequest,
              message: message.updateFailed
            };
          }

          if (!companyData.isCompanyErp) {
            await Address.findOneAndUpdate(
              {
                $and: [
                  { companyId: companyData._id },
                  { isDeleted: false }
                ]
              },
              {
                $set: {
                  slug: await generateAddressSlug(name, constants.addressTypes.work, pinCode),
                  name: name,
                  constraint: constants.constraint.primary,
                  type: constants.addressTypes.work,
                  email: companyData.companyEmail.value,
                  phone: await phoneFormat(companyData.companyPhone.value),
                  "address.line_one": Object.values(element)[8],
                  "address.line_two": Object.values(element)[9],
                  "address.city": new mongoose.Types.ObjectId(pindata.cityId),
                  "address.state": new mongoose.Types.ObjectId(pindata.stateId),
                  "address.country": new mongoose.Types.ObjectId(pindata.countryId),
                  "address.pin_code": pinCode.toString(),
                  isDeleted: false,
                  createdBy: new mongoose.Types.ObjectId(req?.id),
                  updatedBy: new mongoose.Types.ObjectId(req?.id)
                }
              },
              { upsert: true, new: true }
            );
          }
        } else if (companyType === constants.companyCategory.individual) {
          const existingCompany :any= await Company.findOne({
            companyType: constants.companyCategory.company,
            "gst.value": gstValue,
            isDeleted: false
          });

          if (existingCompany) {
            
            if (!existingCompany.isCompanyErp) {
              const existedAddress= await Address.findOne({
                name: name,
                companyId: existingCompany._id,
                isDeleted: false
              });

              if (!existedAddress) {
                await Address.updateOne(
                  {
                    slug: await generateAddressSlug(name, constants.addressTypes.warehouse, pinCode),
                    companyId: existingCompany._id,
                    isDeleted: false
                  },
                  {
                    $set: {
                      slug: await generateAddressSlug(name, constants.addressTypes.warehouse, pinCode),
                      name: name,
                      constraint: constants.constraint.secondary,
                      type: constants.addressTypes.warehouse,
                      email: existingCompany.companyEmail.value,
                      phone: await phoneFormat(existingCompany.companyPhone.value),
                      "address.line_one": Object.values(element)[8],
                      "address.line_two": Object.values(element)[9],
                      "address.city": new mongoose.Types.ObjectId(pindata.cityId),
                      "address.state": new mongoose.Types.ObjectId(pindata.stateId),
                      "address.country": new mongoose.Types.ObjectId(pindata.countryId),
                      "address.pin_code": pinCode.toString(),
                      isDeleted: false,
                      createdBy: new mongoose.Types.ObjectId(req?.id),
                      updatedBy: new mongoose.Types.ObjectId(req?.id)
                    }
                  },
                  { upsert: true, new: true }
                );
              }
            }
          } else {
            const newCompany:any = await Company.create({
              name: name,
              companyType: constants.companyCategory.individual,
              gstType: Object.values(element)[3],
              reference_id: "",
              "companyEmail.value": Object.values(element)[5],
              "companyPhone.value": await phoneFormat(Object.values(element)[6]),
              foundingYear: 2022,
              buyerAndSupplier: Object.values(element)[2],
              "gst.value": gstValue,
              contactPerson: {
                name: Object.values(element)[14],
                phone: Object.values(element)[15],
                email: Object.values(element)[16]
              },
              pan: {
                value: await getPanFromGst(gstValue)
              },
              createdBy: new mongoose.Types.ObjectId(req?.id),
              updatedBy: new mongoose.Types.ObjectId(req?.id),
              isDeleted: false
            });

            if (!newCompany) {
              throw {
                statusCode: constants.code.badRequest,
                message: message.updateFailed
              };
            }

            await Address.create({
              companyId: newCompany._id,
              slug: await generateAddressSlug(name, constants.addressTypes.warehouse, pinCode),
              name: name,
              constraint: constants.constraint.primary,
              type: constants.addressTypes.work,
              email: newCompany.companyEmail.value,
              phone: await phoneFormat(newCompany.companyPhone.value),
              "address.line_one": Object.values(element)[8],
              "address.line_two": Object.values(element)[9],
              "address.city": pindata.cityId,
              "address.state": pindata.stateId,
              "address.country": pindata.countryId,
              "address.pin_code": pinCode.toString(),
              isDeleted: false,
              createdBy: new mongoose.Types.ObjectId(req?.id),
              updatedBy: new mongoose.Types.ObjectId(req?.id)
            });
          }
        }
      }
    }
    await removeFile(req.file.filename);
    return res.status(constants.code.success).json({
      status: constants.status.statusTrue,
      userStatus: req.status,
      message: message.bulkCompanyUpload
    });
  } catch (error: any) {
    console.log("errorr", error);

    return res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error.message ? error.message : error
    });
  }
};





// const addCompanyBulk = async (req: any, res: Response, next: NextFunction) => {
//   try {
//     const createdBy = req?.id;
//     const data = excelToJson({
//       sourceFile: req.file.path,
//       sheets: ["companies"], 
//       sheetStubs: true
//     });

//     const columns = [
//       "Name",
//       "Company Type",
//       "Business Type",
//       "GST Type",
//       "GST Number",
//       "Email",
//       "Phone",
//       "Mobile",
//       "Address Line 1",
//       "Address Line 2",
//       "City",
//       "Zip Code",
//       "State",
//       "Area",
//       "Contact Person Name 1",
//       "Contact Person Phone 1",
//       "Contact Person Email 1",
//       "Contact Person Name 2",
//       "Contact Person Phone 2",
//       "Contact Person Email 2",
//     ];

//     const excelData = await validateExcelColumns(columns, data["companies"]);
//     excelData.shift(); // Remove header row
//     excelData.sort((a: any, b: any) => {
//       if (a["Company Type"] && b["Company Type"]) {
//         return a["Company Type"].localeCompare(b["Company Type"]);
//       }
//       return 0;
//     });


//     for (const [index, element] of excelData.entries()) {
//       // console.log(`Processing row ${index + 1}`);

//       let pinCode:any = Object.values(element)[11];
//       let pindata:any = await getPinDetail(pinCode);
//       const name: any = Object.values(element)[0];


//       if (pinCode == null) {
//                 pinCode = `222302`,
//                 pindata = await getPinDetail(pinCode)
//           }

//       if (!pindata) {
//         continue; 
//       }

//       const companyData = {
//         name,
//         companyType: Object.values(element)[1],
//         gstType: Object.values(element)[3],
//         reference_id: "",
//         "companyEmail.value": Object.values(element)[5],
//         "companyPhone.value": await phoneFormat(Object.values(element)[6]),
//         foundingYear: 2022,
//         buyerAndSupplier: Object.values(element)[2],
//         "gst.value": Object.values(element)[4],
//         contactPersonName: Object.values(element)[14],
//         "contactPhone.value": await phoneFormat(Object.values(element)[15]),
//         "contactEmail.value": Object.values(element)[16],
//         "contactPersonOne.name": Object.values(element)[14],
//         "contactPersonOne.phone": await phoneFormat(Object.values(element)[15]),
//         "contactPersonOne.email": Object.values(element)[16],
//         "contactPersonTwo.name": Object.values(element)[17],
//         "contactPersonTwo.phone": await phoneFormat(Object.values(element)[18]),
//         "contactPersonTwo.email": Object.values(element)[19],
//         createdBy: new mongoose.Types.ObjectId(createdBy),
//         updatedBy: new mongoose.Types.ObjectId(createdBy),
//         isDeleted: false,
//       };

//       if (Object.values(element)[1] === constants.companyCategory.company) {
//         await Company.findOneAndUpdate(
//           {
//             $and: [
//               {
//                 "gst.value": Object.values(element)[4],
//                 "companyEmail.value": Object.values(element)[5],
//                 name,
//                 companyType: constants.companyCategory.company,
//                 isDeleted: false,
//               },
//             ],
//           },
//           companyData,
//           { new: true, upsert: true }
//         ).then(async (companyData: any) => {
//           if (!companyData) {
//             throw new Error("Update failed");
//           }
//           await Address.findOneAndUpdate(
//             {
//               companyId: companyData._id,
//               email: companyData.companyEmail.value,
//               isDeleted: false,
//             },
//             {
//               companyId: companyData._id,
//               slug: await generateAddressSlug(
//                                         name,
//                                         constants.addressTypes.warehouse,
//                                         pinCode
//                                       ),
//               name,
//               constraint: constants.constraint.primary,
//               type: constants.addressTypes.work,
//               email: companyData.companyEmail.value,
//               phone: await phoneFormat(companyData.companyPhone.value),
//               "address.line_one": Object.values(element)[8],
//               "address.line_two": Object.values(element)[9],
//               "address.city": new mongoose.Types.ObjectId(pindata.cityId),
//               "address.state": new mongoose.Types.ObjectId(pindata.stateId),
//               "address.country": new mongoose.Types.ObjectId(pindata.countryId),
//               "address.pin_code": pinCode.toString(),
//               isDeleted: false,
//               createdBy: new mongoose.Types.ObjectId(createdBy),
//               updatedBy: new mongoose.Types.ObjectId(createdBy),
//             },
//             { upsert: true, new: true }
//           );
//         }).catch((err) => {
//           console.error("Company update error:", err);
//           return res.status(constants.code.preconditionFailed).json({
//             status: constants.status.statusFalse,
//             userStatus: req.status,
//             message: err.message,
//           });
//         });
//       } else if (Object.values(element)[1] === constants.companyCategory.individual) {

//         const existingCompany = await Company.exists({
//           companyType: constants.companyCategory.individual,
//           "gst.value": Object.values(element)[4],
//           isDeleted: false,
//         });

//         if (existingCompany) {
//           await Company.findOne({ companyType: constants.companyCategory.individual, "gst.value": Object.values(element)[4], isDeleted: false })
//             .then(async (companyData: any) => {
//               if (!companyData) {
//                 throw new Error("Company not found");
//               }
//               const existingAddress = await Address.findOne({ name, companyId: companyData._id });
//               if (existingAddress) {
//                 await Address.updateOne(
//                   {
//                     companyId: companyData._id,
//                     slug: await generateAddressSlug(name, constants.addressTypes.warehouse, pinCode),
//                     isDeleted: false,
//                   },
//                   {
//                     slug: await generateAddressSlug(name, constants.addressTypes.warehouse, pinCode),
//                     name,
//                     constraint: constants.constraint.secondary,
//                     type: constants.addressTypes.warehouse,
//                     email: companyData.companyEmail.value,
//                     phone: await phoneFormat(companyData.companyPhone.value),
//                     "address.line_one": Object.values(element)[8],
//                     "address.line_two": Object.values(element)[9],
//                     "address.city": new mongoose.Types.ObjectId(pindata.cityId),
//                     "address.state": new mongoose.Types.ObjectId(pindata.stateId),
//                     "address.country": new mongoose.Types.ObjectId(pindata.countryId),
//                     "address.pin_code": pinCode.toString(),
//                     isDeleted: false,
//                     createdBy: new mongoose.Types.ObjectId(createdBy),
//                     updatedBy: new mongoose.Types.ObjectId(createdBy),
//                   }
//                 );
//               }
//             }).catch((err) => {
//               console.error("Individual update error:", err);
//               return res.status(constants.code.preconditionFailed).json({
//                 status: constants.status.statusFalse,
//                 userStatus: req.status,
//                 message: err.message,
//               });
//             });
//         } else {
//           await Company.create(companyData)
//             .then(async (companyData: any) => {
//               if (!companyData) {
//                 throw new Error("Company creation failed");
//               }
//               await Address.create({
//                 companyId: companyData._id,
//                 slug: await generateAddressSlug(name, constants.addressTypes.warehouse, pinCode),
//                 name,
//                 constraint: constants.constraint.primary,
//                 type: constants.addressTypes.work,
//                 email: companyData.companyEmail.value,
//                 phone: await phoneFormat(companyData.companyPhone.value),
//                 "address.line_one": Object.values(element)[8],
//                 "address.line_two": Object.values(element)[9],
//                 "address.city": new mongoose.Types.ObjectId(pindata.cityId),
//                 "address.state": new mongoose.Types.ObjectId(pindata.stateId),
//                 "address.country": new mongoose.Types.ObjectId(pindata.countryId),
//                 "address.pin_code": pinCode.toString(),
//                 isDeleted: false,
//                 createdBy: new mongoose.Types.ObjectId(createdBy),
//                 updatedBy: new mongoose.Types.ObjectId(createdBy),
//               });
//             }).catch((err) => {
//               console.error("Address creation error:", err);
//               return res.status(constants.code.preconditionFailed).json({
//                 status: constants.status.statusFalse,
//                 userStatus: req.status,
//                 message: err.message,
//               });
//             });
//         }
//       }
//     }

//     await removeFile(req.file.filename);

//     return res.status(constants.code.success).json({
//       status: constants.status.statusTrue,
//       userStatus: req.status,
//       message: message.bulkCompanyUpload
//     });
//   } catch (error: any) {
//     console.error("Error in bulk upload:", error);
//     return res.status(constants.code.preconditionFailed).json({
//       status: constants.status.statusFalse,
//       userStatus: req.status,
//       message: error.message || "An unexpected error occurred",
//     });
//   }
// };






const addnewwCompanyBulk = async (req: any, res: Response, next: NextFunction) => {
  try {
    let createdBy = req?.id;
    const data = excelToJson({
      sourceFile: req.file.path,
      sheets: ["companies"],
      sheetStubs: true
    });

    const columns: any = [
      "Name",
      "Company Type",
      "Business Type",
      "GST Type",
      "GST Number",
      "Email",
      "Phone",
      "Mobile",
      "Address Line 1",
      "Address Line 2",
      "City",
      "Zip Code",
      "State",
      "Area",
      "Contact Person Name 1",
      "Contact Person Phone 1",
      "Contact Person Email 1",
      "Contact Person Name 2",
      "Contact Person Phone 2",
      "Contact Person Email 2",
    ];
    const excelData = await validateExcelColumns(columns, data["companies"]);
    excelData.shift();
    excelData.sort((a: any, b: any) => {
      if ((a["Company Type"]) && (b["Company Type"])) {
        a["Company Type"].localeCompare(b["Company Type"])
      }
    }
    );

    for (let index = 0; index < excelData.length; index++) {
      const element = excelData[index];
      let pinCode: any = Object.values(element)[11];
      let pindata: any = await getPinDetail(`${pinCode}`);
      const name: any = Object.values(element)[0];
      // if (!pindata) {
      //   console.log(index + `does not have correct pin`, `${pinCode}`)
      // }
      if (pinCode == null) {
        pinCode = `222302`,
          pindata = await getPinDetail(pinCode)
      }

      if (
        !Object.values(element)[4] ||
        !pindata
      ) {

        // console.log( !Object.values(element)[4] ,!Object.values(element)[5])
        // console.log('skipping index',index)
        continue;
      } else {
        if (Object.values(element)[1] === constants.companyCategory.company) {
          await Company.findOneAndUpdate(
            {
              $and: [
                {
                  "gst.value": Object.values(element)[4],
                  "companyEmail.value": Object.values(element)[5],
                  name: name,
                  companyType: constants.companyCategory.company,
                  isDeleted: false,
                },
              ],
            },
            {
              gstType: Object.values(element)[3],
              companyType: Object.values(element)[1],
              reference_id: "",
              "companyEmail.value": Object.values(element)[5],
              "companyPhone.value": await phoneFormat(
                Object.values(element)[6]
              ),
              foundingYear: 2022,
              buyerAndSupplier: Object.values(element)[2],
              "gst.value": Object.values(element)[4],
              contactPerson:{
                name: Object.values(element)[14],
                phone: Object.values(element)[15],
                email: Object.values(element)[16],
                },
              pan: {
                value: await getPanFromGst(Object.values(element)[4])
              },
              createdBy: new mongoose.Types.ObjectId(req?.id),
              updatedBy: new mongoose.Types.ObjectId(req?.id),
              isDeleted: false,
            },
            { new: true, upsert: true }
          )
            .then(async (companyData: any) => {
              if (!companyData) {
                throw {
                  statusCode: constants.code.badRequest,
                  message: message.updateFailed,
                };
                
              } else {
                if (!companyData.isCompanyErp) {
                await Address.findOneAndUpdate(
                  {
                    companyId: companyData._id,
                    email: companyData.companyEmail.value,
                    isDeleted: false,
                  },
                  {
                    companyId: companyData._id,
                    slug: await generateAddressSlug(
                      name,
                      constants.addressTypes.work,
                      pinCode
                    ),
                    name: name,
                    constraint: constants.constraint.primary,
                    type:
                      companyData.companyType == constants.constraint.primary
                        ? constants.addressTypes.work
                        : constants.addressTypes.warehouse,
                    email: companyData.companyEmail.value,
                    phone: await phoneFormat(companyData.companyPhone.value),
                    "address.line_one": Object.values(element)[8],
                    "address.line_two": Object.values(element)[9],
                    "address.city": new mongoose.Types.ObjectId(pindata.cityId),
                    "address.state": new mongoose.Types.ObjectId(
                      pindata.stateId
                    ),
                    "address.country": new mongoose.Types.ObjectId(
                      pindata.countryId
                    ),
                    "address.pin_code": pinCode.toString(),
                    isDeleted: false,
                    createdBy: new mongoose.Types.ObjectId(req?.id),
                    updatedBy: new mongoose.Types.ObjectId(req?.id),
                  },
                  { upsert: true, new: true }
                )
                  .then((data) => {
                    if (!data) {
                      throw {
                        statusCode: constants.code.dataNotFound,
                        message: constants.message.dataNotFound,
                      };
                    }
                  })
                  .catch((err) => {
                    console.log("err", err);

                    return res.status(err.statusCode).json({
                      status: constants.status.statusFalse,
                      userStatus: req.status,
                      message: err.message,
                    });
                  });
              }
            }
            })
            .catch((err) => {
              console.log("err1", err);

              return res.status(err.statusCode).json({
                status: constants.status.statusFalse,
                userStatus: req.status,
                message: err.message,
              });
            });
        } else if (
          Object.values(element)[1] === constants.companyCategory.individual
        ) {
          const findCompanyWithCompanyTypeCompany = await Company.exists({
            companyType: constants.companyCategory.individual,
            "gst.value": Object.values(element)[4],
            isDeleted: false,
          });
          if (findCompanyWithCompanyTypeCompany) {
            await Company.findOne({
              companyType: constants.companyCategory.individual,
              "gst.value": Object.values(element)[4],
              isDeleted: false,
            })
              .then(async (companyData: any) => {
                if (!companyData) {
                  throw {
                    statusCode: constants.code.badRequest,
                    message: message.updateFailed,
                  };
                } else {
                  if (!companyData.isCompanyErp) {
                  const existedAddress = await Address.findOne({ name: name, companyId: companyData._id })
                  if (existedAddress) {
                    await Address.updateOne(
                      {
                        companyId: companyData._id,
                        slug: await generateAddressSlug(
                          name,
                          constants.addressTypes.warehouse,
                          pinCode
                        ),
                        name: name,
                        constraint: constants.constraint.secondary,
                        type:
                          companyData.companyType == constants.constraint.primary
                            ? constants.addressTypes.work
                            : constants.addressTypes.warehouse,
                        email: companyData.companyEmail.value,
                        phone: await phoneFormat(companyData.companyPhone.value),
                        "address.line_one": Object.values(element)[8],
                        "address.line_two": Object.values(element)[9],
                        "address.city": new mongoose.Types.ObjectId(
                          pindata.cityId
                        ),
                        "address.state": new mongoose.Types.ObjectId(
                          pindata.stateId
                        ),
                        "address.country": new mongoose.Types.ObjectId(
                          pindata.countryId
                        ),
                        "address.pin_code": pinCode.toString(),
                        isDeleted: false,
                        createdBy: new mongoose.Types.ObjectId(req?.id),
                        updatedBy: new mongoose.Types.ObjectId(req?.id),
                      },
                    ).then((updatedAddress) => {
                      if (!updatedAddress) {
                        throw {
                          statusCode: constants.code.dataNotFound,
                          message: constants.message.dataNotFound,
                        };
                      }
                    }).
                      catch((err) => {
                        console.log("err111", err);

                        return res.status(err.statusCode).json({
                          status: constants.status.statusFalse,
                          userStatus: req.status,
                          message: err.message,
                        });
                      })
                  }

                }
              }
              })
              .catch((err) => {
                console.log("err2", err);

                return res.status(err.statusCode).json({
                  status: constants.status.statusFalse,
                  userStatus: req.status,
                  message: err.message,
                });
              });
          } else {
            await Company.create({
              name: name,
              companyType: constants.companyCategory.individual,
              gstType: Object.values(element)[3],
              reference_id: "",
              "companyEmail.value": Object.values(element)[5],
              "companyPhone.value": await phoneFormat(
                Object.values(element)[6]
              ),
              foundingYear: 2022,
              buyerAndSupplier: Object.values(element)[2],
              "gst.value": Object.values(element)[4],
              contactPerson:{
                name: Object.values(element)[14],
                phone: Object.values(element)[15],
                email: Object.values(element)[16],
                },
              pan: {
                value: await getPanFromGst(Object.values(element)[4])
              },
              createdBy: new mongoose.Types.ObjectId(req?.id),
              updatedBy: new mongoose.Types.ObjectId(req?.id),
              isDeleted: false,
            })
              .then(async (companyData: any) => {
                if (!companyData) {
                  throw {
                    statusCode: constants.code.badRequest,
                    message: message.updateFailed,
                  };
                } else {
                  await Address.create(
                    {
                      companyId: companyData._id,
                      slug: await generateAddressSlug(
                        name,
                        constants.addressTypes.warehouse,
                        pinCode
                      ),
                      name: name,
                      constraint: constants.constraint.primary,
                      type:
                        companyData.CompanyType == constants.constraint.primary
                          ? constants.addressTypes.work
                          : constants.addressTypes.warehouse,
                      email: companyData.companyEmail.value,
                      phone: await phoneFormat(companyData.companyPhone.value),
                      "address.line_one": Object.values(element)[8],
                      "address.line_two": Object.values(element)[9],
                      "address.city": pindata.cityId,
                      "address.state": pindata.stateId,
                      "address.country": pindata.countryId,
                      "address.pin_code": pinCode.toString(),
                      isDeleted: false,
                      createdBy: new mongoose.Types.ObjectId(req?.id),
                      updatedBy: new mongoose.Types.ObjectId(req?.id),
                    }
                  )
                    .then((updatedAddress) => {
                      if (!updatedAddress) {
                        throw {
                          statusCode: constants.code.dataNotFound,
                          message: constants.message.dataNotFound,
                        };
                      }
                    })
                    .catch((err) => {
                      res.status(constants.code.preconditionFailed).json({
                        status: constants.status.statusFalse,
                        userStatus: req.status,
                        message: err.message ? err.message : err,
                      });
                    });
                }
              })
              .catch((err) => {
                res.status(constants.code.preconditionFailed).json({
                  status: constants.status.statusFalse,
                  userStatus: req.status,
                  message: err.message ? err.message : err,
                });
              });
          }
        }
      }
    }


    const childProcessScriptPath = path.resolve(__dirname, 'childProcessScript.js');
    const childProcess = spawn('node', [childProcessScriptPath]);

    childProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    childProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    childProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });

    // Remove uploaded file
    await removeFile(req.file.filename);

    // Respond with success message
    return res.status(constants.code.success).json({
      status: constants.status.statusTrue,
      userStatus: req.status,
      message: message.bulkCompanyUpload,
    });
  } catch (error: any) {
    // Handle errors
    console.error(error);
    return res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error.message ? error.message : error,
    });
  }
};


const addForkCompanyBulk = async (req: any, res: Response, next: NextFunction) => {
  try {
    const createdBy = req?.id;
    const data = excelToJson({
      sourceFile: req.file.path,
      sheets: ["companies"],
      sheetStubs: true
    });
    const columns: any = [
      "Name", "Company Type", "Business Type", "GST Type", "GST Number",
      "Email", "Phone", "Mobile", "Address Line 1", "Address Line 2",
      "City", "Zip Code", "State", "Area", "Contact Person Name 1",
      "Contact Person Phone 1", "Contact Person Email 1",
      "Contact Person Name 2", "Contact Person Phone 2",
      "Contact Person Email 2",
    ];
    const excelData = await validateExcelColumns(columns, data["companies"]);
    excelData.shift();
    excelData.sort((a: any, b: any) => {
      if ((a["Company Type"]) && (b["Company Type"])) {
        a["Company Type"].localeCompare(b["Company Type"])
      }
    }
    );

   
    const promises: Promise<any>[] = [];

    for (let index = 0; index < excelData.length; index++) {
      const element = excelData[index];
      let pinCode: any = Object.values(element)[11];
      let pindata: any = await getPinDetail(`${pinCode}`);
      const name: any = Object.values(element)[0];

      if (pinCode == null) {
        pinCode = `222302`,
          pindata = await getPinDetail(pinCode)
      }
    

      if (!Object.values(element)[4] || !pindata) {
        continue;
      }

      const processPromise = new Promise<void>((resolve, reject) => {

        const forkedScriptPath = path.join(__dirname, 'forkProcess.ts');
        const child = fork(forkedScriptPath);

        child.on('message', async (companyData: any) => {
          console.log("company", companyData);

          try {
            if (!companyData) {
              throw {
                statusCode: constants.code.badRequest,
                message: message.updateFailed,
              };
            }

            const updatedAddress = Address.findOneAndUpdate(
              {
                companyId: companyData._id,
                email: companyData.companyEmail.value,
                isDeleted: false,
              },
              {
                companyId: companyData._id,
                slug: await generateAddressSlug(
                  name,
                  constants.addressTypes.work,
                  pinCode
                ),
                name: name,
                constraint: constants.constraint.primary,
                type:
                  companyData.companyType == constants.constraint.primary
                    ? constants.addressTypes.work
                    : constants.addressTypes.warehouse,
                email: companyData.companyEmail.value,
                phone: await phoneFormat(companyData.companyPhone.value),
                "address.line_one": Object.values(element)[8],
                "address.line_two": Object.values(element)[9],
                "address.city": new mongoose.Types.ObjectId(pindata.cityId),
                "address.state": new mongoose.Types.ObjectId(
                  pindata.stateId
                ),
                "address.country": new mongoose.Types.ObjectId(
                  pindata.countryId
                ),
                "address.pin_code": pinCode.toString(),
                isDeleted: false,
                createdBy: new mongoose.Types.ObjectId(req?.id),
                updatedBy: new mongoose.Types.ObjectId(req?.id),
              },
              { upsert: true, new: true }
            )

            if (!updatedAddress) {
              throw {
                statusCode: constants.code.dataNotFound,
                message: constants.message.dataNotFound,
              };
            }

            console.log(updatedAddress);
            resolve();
          } catch (err) {
            reject(err);
          }
        });

        child.on('error', (err) => {
          reject(err);
        });

        child.send({ element, pinCode, pindata, name, reqId: req?.id });
      });

      promises.push(processPromise);
    }

    await Promise.all(promises);

    await removeFile(req.file.filename);

    return res.status(constants.code.success).json({
      status: constants.status.statusTrue,
      userStatus: req.status,
      message: message.bulkCompanyUpload,
    });
  } catch (error: any) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error.message ? error.message : error,
    });
  }
};



const create = async (req: any, res: Response, next: NextFunction) => {
  try {
    const pinData = await getPinDetail(req.body.pin_code);
    if (!pinData) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: constants.message.invalidPinCode,
      };
    }
    Company.findOne({
      "gst.value": req.body.gstNumber,
      slug: await createSlug(req.body.name),
      isDeleted: false,
    })
      .then(async (companyData) => {
        if (companyData) {
          throw {
            statusCode: constants.code.notAcceptable,
            message: message.companyExist,
          };
        } else {
          const existingEmail = await Company.findOne({
            "companyEmail.value": await toLowerCase(req.body.email),
            isDeleted: false,
          });

          if (existingEmail) {
            throw {
              statusCode: constants.code.notAcceptable,
              message: message.emailExists,
            };
          }

          // Check if the phone number already exists
          const existingPhone = await Company.findOne({
            "companyPhone.value": await phoneFormat(req.body.phone),
            isDeleted: false,
          });

          if (existingPhone) {
            throw {
              statusCode: constants.code.notAcceptable,
              message: message.phoneExists,
            };
          }
          const existGST =  await Company.findOne({
            "gst.value": req.body.gstNumber,
            isDeleted: false,
          })

          if(existGST) {
            throw {
              statusCode: constants.code.notAcceptable,
              message: message.gstExists,
            }
          }

          Company.create(
            {
              name: req.body.name,
              slug: await createSlug(req.body.name ? req.body.name : ''),
              reference_id: req.body.reference_id,
              companyEmail: {
                value: await toLowerCase(req.body.email)
              },
              companyPhone: {
                value: await phoneFormat(req.body.phone)
              },
              foundingYear: req.body?.foundingYear ? req.body?.foundingYear : null,
              contactPerson: {
                name: req.body.contactPersonName,
                phone: await phoneFormat(req.body.contact_phone),
                email: await toLowerCase(req.body.contact_email),
              },
              salesPerson: req.body.salesPersonId ? req.body.salesPersonId : null,
              industry: req.body.industry,
              // userId:"",
              buyerAndSupplier: req.body.buyerAndSupplier,
              gst: {
                value: req.body.gstNumber,
              },
              pan: {
                value: await getPanFromGst(req.body.gstNumber)
              },
              creditLimit: {
                value: req.body.creditLimit,
                validity: req.body.validity
              },
            }
          )
            .then(async (newCompany: any) => {
              if (!newCompany) {
                throw {
                  statusCode: constants.code.preconditionFailed,
                  message: message.companyAddFailed,
                };
              } else {
                Address.findOneAndUpdate(
                  {
                    slug: await generateAddressSlug(
                      req.body.name,
                      constants.addressTypes.work,
                      pinData.pin_code
                    ),
                    email: newCompany.companyEmail.value,
                    isDeleted: false,
                  },
                  {
                    slug: await generateAddressSlug(
                      req.body.name,
                      constants.addressTypes.work,
                      pinData.pin_code
                    ),
                    name: req.body.name,
                    companyId: newCompany._id,
                    constraint: constants.constraint.primary,
                    type: constants.addressTypes.work,
                    email: newCompany.companyEmail?.value,
                    phone: newCompany.companyPhone?.value,
                    alternate_phone: req.body?.alternate_phone,
                    address: {
                      line_one: req.body.address_line_one,
                      line_two: req.body.address_line_two,
                      city: pinData.cityId,
                      state: pinData.stateId,
                      country: pinData.countryId,
                      pin_code: pinData.pinCode,
                    },
                    updatedBy: new mongoose.Types.ObjectId(req?.id),
                  },
                  {
                    new: true,
                    upsert: true,
                  }
                )
                  .then(async (addressCreated) => {
                    if (!addressCreated) {
                      throw {
                        status: constants.code.badRequest,
                        message: "failed to create address",
                      };
                    }
                    else if (req.body.checked) {
                      Address.create({
                        slug: await generateAddressSlug(
                          req.body.name,
                          req.body.address_type,
                          pinData.pinCode
                        ),
                        companyId: new mongoose.Types.ObjectId(
                          newCompany._id
                        ),
                        constraint: constants.constraint.secondary,
                        type: constants.addressTypes.shipping,
                        name: req.body.name,
                        email: newCompany.companyEmail.value,
                        phone: req.body.phone,
                        "creditLimit.value": req.body.creditLimit,
                        "creditLimit.validity": req.body.validity,
                        address: {
                          line_one: req.body.address_line_one,
                          line_two: req.body.address_line_two,
                          city: pinData.cityId,
                          state: pinData.stateId,
                          country: pinData.countryId,
                          pin_code: pinData.pinCode,
                        },
                        landmark: req.body.landmark,
                        latitude: req.body.latitude,
                        longitude: req.body.longitude,
                        createdBy: req.id,
                      }).then((same_address) => {
                        if (!same_address) {
                          throw {
                            statusCode: constants.code.internalServerError,
                            message: constants.message.invalidAddress
                          }
                        }
                        else {
                          res.status(constants.code.success).json({
                            status: constants.status.statusTrue,
                            userStatus: req.status,
                            message: message.CompanySuccess,
                          });
                        }
                      }).catch((err) => {
                        res.status(constants.code.preconditionFailed).json({
                          status: constants.status.statusFalse,
                          userStatus: req.status,
                          message: err.message ? err.message : message.addAddFailed,
                        });
                      })
                    }

                    else {
                      res.status(constants.code.success).json({
                        status: constants.status.statusTrue,
                        userStatus: req.status,
                        message: message.CompanySuccess,
                      });
                    }
                  })
                  .catch((err) => {
                    //addressAdd failed
                    res.status(constants.code.preconditionFailed).json({
                      status: constants.status.statusTrue,
                      userStatus: req.status,
                      message: message.addAddFailed,
                    });
                  });
              }
            })
            .catch((err) => {
              //company creation failed error
              res.status(err.statusCode || constants.code.preconditionFailed)
                .json({
                  status: constants.status.statusFalse,
                  userStatus: req.status,
                  message: err.message,
                });
            });
        }
      })
      .catch((err) => {
        res.status(err.statusCode || constants.code.preconditionFailed).json({
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: err.message,
        });
      });
  } catch (error: any) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};

const detail = async (req: any, res: Response, next: NextFunction) => {
  try {
    Company.findOne({
      _id: new mongoose.Types.ObjectId(req.params.company_id),
      isDeleted: false,
    })
      .then(async (companyDetails: any) => {
        if (!companyDetails) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: constants.message.dataNotFound,
          };
        } else {
          Company.aggregate([
            { $match: { _id: companyDetails._id, isDeleted: false } },
            {
              $lookup: {
                from: "addresses",
                localField: "_id",
                foreignField: "companyId",
                as: "addressDetail",
              },
            },
            {
              $unwind: "$addressDetail",
            },
            {
              $match: {
                "addressDetail.constraint": "primary",
              },
            },
            {
              $lookup: {
                from: "cities",
                localField: "addressDetail.address.city",
                foreignField: "_id",
                as: "cityDetail",
              },
            },
            { $unwind: "$cityDetail" },
            {
              $lookup: {
                from: "states",
                localField: "addressDetail.address.state",
                foreignField: "_id",
                as: "stateDetail",
              },
            },
            { $unwind: "$stateDetail" },
            {
              $lookup: {
                from: "countries",
                localField: "stateDetail.countryId",
                foreignField: "_id",
                as: "countryDetail",
              },
            },
            { $unwind: "$countryDetail" },
            {
              $lookup: {
                from: "users",
                localField: "salesPerson",
                foreignField: "_id",
                as: "salesPersonDetail"
              }
            },
            {
              $unwind: {
                path: "$salesPersonDetail",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $project: {
                city: "$cityDetail.name",
                state: "$stateDetail.name",
                country: "$countryDetail.name",
                contactPersonName: "$contactPerson.name",
                contactEmail: "$contactPerson.email",
                contactPhone: "$contactPerson.phone",
                companyEmail: 1,
                companyPhone: 1,
                logo: 1,
                logoUrl: 1,
                name: 1,
                gst: 1,
                creditLimit: 1,
                salesPersonName: { $concat: ["$salesPersonDetail.fname", "$salesPersonDetail.lname"] },
                salespersonEmail: "$salesPersonDetail.email.value",
                salesPersonPhone: "$salesPersonDetail.phone.value",
                salespersonId: "$salesPersonDetail._id",
              },
            },
          ])
            .then(async (companyFullDetail: any) => {
              if (!companyFullDetail) {
                throw {
                  statusCode: constants.code.dataNotFound,
                  message: constants.message.dataNotFound,
                };
              } else {
                res.status(constants.code.success).json({
                  status: constants.status.statusFalse,
                  userStatus: req.status,
                  companyDetail: companyFullDetail,
                });
              }
            })
            .catch((err) => {
              res.status(err.statusCode).json({
                status: constants.status.statusFalse,
                userStatus: req.status,
                message: err.message,
              });
            });
        }
      })
      .catch((err) => {
        res.status(err.statusCode).json({
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: err.message,
        });
      });
  } catch (error) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};

const update = async (req: any, res: Response, next: NextFunction) => {
  try {
    const phoneExists = await Company.exists({
      "companyPhone.value": await phoneFormat(req.body.phone),
      _id: { $nin: [new mongoose.Types.ObjectId(req.params.company_id)] },
      isDeleted: false,
    });

    const emailExists = await Company.exists({
      "companyEmail.value": req.body.email,
      _id: { $nin: [new mongoose.Types.ObjectId(req.params.company_id)] },
      isDeleted: false,
    });

    if (phoneExists) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.phoneTaken,
      };
    }

    if (emailExists) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.emailTaken,
      };
    }

    await Company.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.params.company_id),
        isDeleted: false,
      },
      // {
      //   name: req.body.name,
      //   slug: await createSlug(req.body.name),
      //   "companyEmail.value": await toLowerCase(req.body.email),
      //   "companyPhone.value": await phoneFormat(req.body.phone),
      //   "contactEmail.value": await toLowerCase(req.body.contact_email),
      //   "contactPhone.value": await phoneFormat(req.body.contact_phone),
      //   // "creditLimit.value":req.body.creditLimit,
      //   // "creditLimit.validity":req.body.validity,
      //    creditLimit:{
      //         value: req.body?.creditLimit?Number(req.body?.creditLimit):null,
      //         validity:req.body?.validity?Number(req.body?.validity):null,
      //       },
      //     salesPerson:{_id:new mongoose.Types.ObjectId(req.body.salesPersonId)?new mongoose.Types.ObjectId(req.body.salesPersonId):null},
      //     contactPersonName: req.body.contactPersonName,
      //     gst: {
      //       value: req.body.gstNumber,
      //     },


      //   updatedBy: new mongoose.Types.ObjectId(req?.id),
      // }
      {
        name: req.body.name,
        slug: await createSlug(req.body.name),
        reference_id: req.body?.reference_id,
        companyEmail: {
          value: await toLowerCase(req.body.email)
        },
        companyPhone: {
          value: await phoneFormat(req.body.phone)
        },
        foundingYear: req.body?.foundingYear ? req.body?.foundingYear : null,
        contactPerson: {
          name: req.body.contactPersonName,
          phone: await phoneFormat(req.body.contact_phone),
          email: await toLowerCase(req.body.contact_email),
        },
        salesPerson: new mongoose.Types.ObjectId(req.body.salesPersonId) ? new mongoose.Types.ObjectId(req.body.salesPersonId) : null,
        // salesPerson:new mongoose.Types.ObjectId("66a341d92783dacb326a2644"),
        industry: req.body?.industry,
        // userId:"",
        buyerAndSupplier: req.body.buyerAndSupplier,
        gst: {
          value: req.body.gstNumber,
        },
        creditLimit: {
          value: req.body.creditLimit,
          validity: req.body.validity
        },
      }
    )
      .then(async (updatedCompany) => {
        if (!updatedCompany) {
          throw {
            status: constants.message.dataNotFound,
            message: message.updateFailed,
          };
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: message.updateSuccess,
          });
        }
      })
      .catch((err) => {
        res.status(err.statusCode || constants.code.dataNotFound).json({
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: err.message,
        });
      });
  } catch (error: any) {
    res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error?.msg ? error.msg : error?.message ? error.message : error
    });
  }
};

const deleteCompany = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.body.is_delete) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      const companyIds: any = [];
      for (let i = 0; i <= req.body.company_ids.length; i++) {
        companyIds.push(new mongoose.Types.ObjectId(req.body.company_ids[i]));
      }
      Company.updateMany(
        {
          _id: { $in: companyIds },
          isDeleted: false,
          status: true,
          isCompanyErp: false,
        },
        {
          isDeleted: req.body.is_delete,
          deletedBy: req.id,
        }
      )
        .then((data) => {
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.deleteCompanySuccess,
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
  } catch (err) {
    res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

const companyList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;
    const sort = req.query.sort === "desc" ? -1 : 1;

    let matchAddress = {
      $match: {
        isDeleted: false,
        "addressDetail.constraint": constants.constraint.primary,
      },
    };

    if (Number(req.query.limit) !== 0) {
      Company.aggregate([
        {
          $lookup: {
            from: "addresses",
            localField: "_id",
            foreignField: "companyId",
            as: "addressDetail",
          },
        },
        { $unwind: "$addressDetail" },
        matchAddress,
        // {
        //   $match: {
        //     isDeleted: false,
        //     "addressDetail.constraint": constants.constraint.primary,
        //   },
        // },
        {
          $lookup: {
            from: "cities",
            localField: "addressDetail.address.city",
            foreignField: "_id",
            as: "cityDetail",
          },
        },
        { $unwind: "$cityDetail" },
        {
          $sort: { createdAt: sort },
        },
        {
          $project: {

            // contactPersonName:1,
            // slug:1,
            // reference_id:1,
            // companyEmail:1,
            // companyPhone:1,
            // contactEmail:1,
            // contactPhone:1,
            // buyerAndSupplier:1,
            // createdAt:1,
            // gst:1,
            // addressDetail:"$addressDetail",
            // cityDetail:"$cityDetail",
            _id: 1,
            name: 1,
            cityId: "$cityDetail._id",
            createdAt: 1,
            buyerAndSupplier: 1,
            cityName: "$cityDetail.name"
          },
        },
        {
          $match: {
            $or: [
              {
                buyerAndSupplier: {
                  $regex: "^" + req.query.filter + ".*",
                  $options: "i",
                },
              },
            ],
          },
        },
        {
          $match: {
            $or: [
              {
                name: {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              },
              {
                "cityDetail.name": {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              }

            ],
          },
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
        .then((companyList: any) => {
          if (!companyList) {
            throw {
              statusCode: constants.code.dataNotFound,
              message: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              statusCode: constants.status.statusTrue,
              userStatus: req.status,
              message: companyList,
            });
          }
        })
        .catch((err) => {
          res.status(req.statusCode).json({
            statusCode: req.statusCode,
            userStatus: req.statusCode,
            message: "Internal Server Error",
          });
        });
    } else {
      Company.aggregate([
        //{
        //   $match: {
        //     isDeleted: false,
        //     buyerAndSupplier: {
        //       $regex: req.query.search,
        //       $options: "i",
        //     },
        //     name: {
        //       $regex: "^" + req.query.search + ".*",
        //       $options: "i",
        //     },
        //   },
        // },
        {
          $lookup: {
            from: "addresses",
            localField: "_id",
            foreignField: "companyId",
            as: "addressDetail",
          },
        },
        { $unwind: "$addressDetail" },
        matchAddress,
        // {
        //   $match: {
        //     isDeleted: false,
        //     "addressDetail.constraint": constants.constraint.primary,
        //   },
        // },
        {
          $lookup: {
            from: "cities",
            localField: "addressDetail.address.city",
            foreignField: "_id",
            as: "cityDetail",
          },
        },
        { $unwind: "$cityDetail" },
        {
          $sort: { createdAt: sort },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            cityId: "$cityDetail._id",
            cityName: "$cityDetail.name",
            createdAt: 1,
            buyerAndSupplier: 1,
          },
        },
        {
          $match: {
            $or: [
              {
                buyerAndSupplier: {
                  $regex: "^" + req.query.filter + ".*",
                  $options: "i",
                },
              },
            ],
          },
        },
        {
          $match: {
            $or: [
              {
                name: {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              },
              {
                "cityDetail.name": {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              }

            ],
          },
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
        .then((companyList: any) => {
          if (!companyList) {
            throw {
              statusCode: constants.code.dataNotFound,
              message: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              statusCode: constants.status.statusTrue,
              userStatus: req.status,
              message: companyList,
            });
          }
        })
        .catch((err) => {
          res.status(req.statusCode).json({
            statusCode: req.statusCode,
            userStatus: req.statusCode,
            message: "Internal Server Error",
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

const changeCompanyLogo = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    Company.findOne({
      _id: new mongoose.Types.ObjectId(req.params.company_id),
      isDeleted: false,
    })
      .then(async (data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else if (!data.logo) {
          Company.findOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(req.params.company_id),
              isDeleted: false,
            },
            {
              logo: await logoUrl(req.headers.host, req.file.filename),
            },
            { new: true }
          )
            .then((data) => {
              if (!data) {
                throw {
                  statusCode: constants.code.dataNotFound,
                  msg: constants.message.dataNotFound,
                };
              } else {
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  userStatus: req.status,
                  message: message.logoChangeSuccess,
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
          await removeLogo(await getFileName(data.logo));
          Company.findOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(req.params.company_id),

              isDeleted: false,
            },
            {
              logo: await logoUrl(req.headers.host, req.file.filename),
            },
            { new: true }
          )
            .then((data) => {
              if (!data) {
                throw {
                  statusCode: constants.code.dataNotFound,
                  msg: constants.message.dataNotFound,
                };
              } else {
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  userStatus: req.status,
                  message: message.logoChangeSuccess,
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
      })
      .catch((err) => {
        res.status(err.statusCode).json({
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: err.msg,
        });
      });
  } catch (err) {
    res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

const deleteCompanyLogo = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    Company.findOne({
      _id: new mongoose.Types.ObjectId(req.params.company_id),
      isDeleted: false,
    })
      .then(async (data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else if (!data.logo) {
        } else {
          await removePhoto(await getFileName(data.logo));
          Company.findOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(req.params.company_id),

              isDeleted: false,
            },
            {
              profilePicture: await photoUrl(
                req.headers.host,
                req.file.filename
              ),
            },
            { new: true }
          )
            .then((data) => {
              if (!data) {
                throw {
                  statusCode: constants.code.dataNotFound,
                  msg: constants.message.dataNotFound,
                };
              } else {
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  userStatus: req.status,
                  message: message.logoChangeSuccess,
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
      })
      .catch((err) => {
        res.status(err.statusCode).json({
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: err.msg,
        });
      });
  } catch (err) {
    res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

export default {
  addCompanyBulk,
  addnewwCompanyBulk,
  addForkCompanyBulk,
  create,
  detail,
  update,
  deleteCompany,
  companyList,
  changeCompanyLogo,
  deleteCompanyLogo
};
