import express from "express";
import { checkAuth, checkRole } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { imageTransformMiddleware } from "../middleware/imageTransformMiddleware.js";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductVideo,
} from "../controllers/productController.js";

const router = express.Router();

// All routes require admin role
router.use(checkAuth, checkRole("admin"));

// Product CRUD
router.post(
  "/products",
  upload.array("Image"),
  imageTransformMiddleware,
  createProduct
);
router.get("/products", getProducts);
router.get("/products/:id", getProduct);
router.put(
  "/products/:id",
  upload.array("Image"),
  imageTransformMiddleware,
  updateProduct
);
router.delete("/products/:id", deleteProduct);
router.put("/products/:id/video", upload.single("Video"), updateProductVideo);
router.put("/products/:id/video", upload.single("Video"), updateProductVideo);

export default router;
