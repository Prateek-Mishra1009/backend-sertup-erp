import mongoose, { Schema, model } from "mongoose";
import { createSlug, unixTime } from "../helpers/helper";
import User from "./user";
import constants from "../utils/constants";

const departmentSchema = new Schema(
  {
    name:{type:String, required:true},
    slug:{type:String, required:true},
    description:{type:String},
    status: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

departmentSchema.method("getDepartmentDetail", async function getDepartmentDetail() {
  return {
    _id: this._id,
  
    departmentName: this.name,
    createdBy: this.createdBy,
    updatedBy: this.updatedBy,
    deletedBy: this.deletedBy,
    createdAt: await unixTime(this.createdAt),
    updatedAt: await unixTime(this.updatedAt),
  };
});

const Department = model("department", departmentSchema);


const departments=[{name:"Development"},{name:"Design"},{name:"Marketing"},{name:"Testing"},{name:"Content"},{name:'Product-Managemant'}]

const department= async()=>{
  try{
    Department.exists({slug:await createSlug('Administration')}).then(async(data)=>{
      if(!data){
        User.findOne({role:constants.accountLevel.superAdmin,isDeleted:false}).then(async(superAdminData:any)=>{
          Department.create({
            name:'Administration',
            slug: await createSlug('administration'),
            description:'This is administration Department and user from this department has access to everything',
          }).then((adminDepartment)=>{
           console.log(`administration department created`)
          })
        })
      }
    })
  }catch(error){
console.log(error);

  }
}
   department();

export default Department;
