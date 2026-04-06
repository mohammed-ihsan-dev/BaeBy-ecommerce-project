import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import upload from "../middlewares/uploadMiddleware.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/upload
// General route for image uploads (Cloudinary)
router.post("/", protect, upload.single("image"), uploadImage);

// TEST ROUTE
router.get("/test", (req, res) => {
    res.json({ message: "Upload route /test is working" });
});

export default router;
