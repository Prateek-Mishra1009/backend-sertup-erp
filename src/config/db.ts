import mongoose from "mongoose";
import constants from "../utils/constants";

const dbConfig = async (ATLAS_URL: any, LOCAL_URL: any) => {
  const options: object = {};
  const URI: string = ATLAS_URL ? ATLAS_URL : LOCAL_URL;
  await mongoose
    .connect(URI, options)
    .then(() =>
      console.log(
        ATLAS_URL ? constants.message.clConnect : constants.message.dbConnect
      )
    )
    .catch((err: any) => {
      console.log(err);
    });
};

export default dbConfig;
