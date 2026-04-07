import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("FATAL ERROR: MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    // Trim whitespace to avoid connection errors like 'ENOTFOUND'
    await mongoose.connect(uri.trim());
    console.log("MongoDB Connected Successfully ");
  } catch (error) {
    console.error("MongoDB Connection Failed ");
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
