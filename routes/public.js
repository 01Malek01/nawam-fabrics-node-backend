import express from "express";
import { getProducts, getProduct } from "../controllers/productController.js";
import {
  getCategories,
  getCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/products", getProducts);
router.get("/products/:id", getProduct);
router.get("/categories", getCategories);
router.get("/categories/:id", getCategory);

export default router;
