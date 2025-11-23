import sharp from "sharp";
import path from "path";
import fs from "fs";
import AppError from "../utils/AppError.js";

export async function imageTransformMiddleware(req, res, next) {
  if (!req.files || req.files.length === 0) return next();
  try {
    await Promise.all(
      req.files.map(async (file) => {
        if (!file.mimetype.startsWith("image/")) return;
        const outputPath = path.join(
          path.dirname(file.path),
          `${path.parse(file.filename).name}.webp`
        );
        await sharp(file.path).webp({ quality: 70 }).toFile(outputPath);
        fs.unlinkSync(file.path); // Remove original file
        file.path = outputPath;
        file.filename = path.basename(outputPath);
        file.mimetype = "image/webp";
      })
    );
    next();
  } catch (err) {
    next(new AppError("Image processing failed", 500));
  }
}
