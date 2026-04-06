import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private
export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error("Please upload a file");
    }

    // Upload image to Cloudinary from memory
    const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "baeby_uploads" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(req.file.buffer);
    });

    res.status(200).send({
        success: true,
        message: "Image uploaded successfully",
        url: uploadResult.secure_url,
    });
});
