import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Product from "./models/Product.js";
import fs from "fs";

dotenv.config();

connectDB();

const seedData = async () => {
  try {
    // Read db.json
    const data = JSON.parse(
      fs.readFileSync("../frontend/db.json", "utf-8")
    );

    // Clear existing products
    await Product.deleteMany();

    // Insert products (remove id field)
    const products = data.products.map(({ id, ...rest }) => rest);

    await Product.insertMany(products);

    console.log(" Database seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Seeding failed", error);
    process.exit(1);
  }
};

seedData();
