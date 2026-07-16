import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not set");
    }

    const connectionInstance = await mongoose.connect(`${mongoUri}/${DB_NAME}`);
    console.log(`\n Connected to MongoDB : ${connectionInstance.connection.host} \n`);
  } catch (err) {
    console.error("ERROR: ", err);
    throw err;
  }
};

export default connectDB;