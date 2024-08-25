import excelToJson from "convert-excel-to-json";
import { fork } from "child_process"
import mongoose from "mongoose";
import {
  validateExcelColumns,
  getPinDetail,
  phoneFormat,
  generateAddressSlug,
  removeFile,
  getPanFromGst,
} from "../../../helpers/helper";
import constants from "../../../utils/constants";
import Company from "../../../models/company";
import Address from "../../../models/address";
import message from "./companyConstant";

const uri = 'mongodb://localhost:27017/ERP';

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

process.on('message', async ({ element, pinCode, pindata, name, reqId }) => {
  console.log();

  try {
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
          contactPersonName: Object.values(element)[14],
          "contactPhone.value": await phoneFormat(
            Object.values(element)[15]
          ),
          "contactEmail.value": Object.values(element)[14],
          "contactPersonOne.name": Object.values(element)[14],
          "contactPersonOne.phone": Object.values(element)[15],
          "contactPersonOne.email": Object.values(element)[16],
          "contactPersonTwo.name": Object.values(element)[17],
          "contactPersonTwo.phone": Object.values(element)[18],
          "contactPersonTwo.email": Object.values(element)[19],
          pan: {
            value: await getPanFromGst(Object.values(element)[4])
          },
          createdBy: new mongoose.Types.ObjectId(reqId),
          updatedBy: new mongoose.Types.ObjectId(reqId),
          isDeleted: false,
        },
        { new: true, upsert: true }
      ).then(async (companyData: any) => {

        if (!companyData) {
          throw {
            statusCode: constants.code.badRequest,
            message: message.updateFailed,
          };
        }

        if (process.send) {
          process.send(companyData);
        } else {
          console.error('process.send is not available.');
        }
      })
    } else if (Object.values(element)[1] === constants.companyCategory.individual) {
      const findCompanyWithCompanyTypeCompany = await Company.exists({
        companyType: constants.companyCategory.individual,
        "gst.value": Object.values(element)[4],
        isDeleted: false,
      });

      if (findCompanyWithCompanyTypeCompany) {
        const companyData = await Company.findOne({
          companyType: constants.companyCategory.individual,
          "gst.value": Object.values(element)[4],
          isDeleted: false,
        });

        if (!companyData) {
          throw {
            statusCode: constants.code.badRequest,
            message: message.updateFailed,
          };
        }

        if (process.send) {
          process.send(companyData);
        } else {
          console.error('process.send is not available.');
        }
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
          contactPersonName: Object.values(element)[14],
          "contactPhone.value": await phoneFormat(
            Object.values(element)[15]
          ),
          "contactEmail.value": Object.values(element)[14],
          "contactPersonOne.name": Object.values(element)[14],
          "contactPersonOne.phone": Object.values(element)[15],
          "contactPersonOne.email": Object.values(element)[16],
          "contactPersonTwo.name": Object.values(element)[17],
          "contactPersonTwo.phone": Object.values(element)[18],
          "contactPersonTwo.email": Object.values(element)[19],
          pan: {
            value: await getPanFromGst(Object.values(element)[4])
          },
          createdBy: new mongoose.Types.ObjectId(reqId),
          updatedBy: new mongoose.Types.ObjectId(reqId),
          isDeleted: false,
        }).
          then(async (companyData: any) => {
            if (!companyData) {
              throw {
                statusCode: constants.code.badRequest,
                message: message.updateFailed,
              };
            }
            if (process.send) {
              process.send(companyData);
            } else {
              console.error('process.send is not available.');
            }
          })

      }
    }
   } catch (err) {
      console.error('Error occurred:', err);
      if (process.send) {
        process.send(null);
      } else {
        console.error('process.send is not available.');
      }
    }
  })



