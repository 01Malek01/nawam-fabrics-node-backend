import express from "express";
import { checkAuth, checkRole } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// All routes require admin role
router.use(checkAuth, checkRole("admin"));

// Category CRUD
router.post("/categories", upload.single("Image"), createCategory);
router.get("/categories", getCategories);
router.get("/categories/:id", getCategory);
router.put("/categories/:id", upload.single("Image"), updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
