import { Schema, model } from "mongoose";
import constants from "../utils/constants";
import { createSlug, unixTime } from "../helpers/helper";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    slug: { type: String, required: true },
    margin:{type:Number,required:true,default:0},
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

categorySchema.method("getCategoryDetail", async function getCategoryDetail() {
  return {
    _id: this._id,
    name: this.name,
    createdAt: await unixTime(this.createdAt),
  };
});

const Category = model("category", categorySchema);

// const defaultCategory=`Tinters`
// Category.exists({slug:`tinters`, isDeleted:false})
// .then(async(data)=>{
//   if(!data){
//     Category.create({name:`Tinters`,slug:await createSlug(`Tinters`)})
//     .then((data)=>{
//       console.log(`created new category tinters`)
//     })
//   }
//   else{
//   console.log(`tinter exists`)
//   }
// })

export default Category;
