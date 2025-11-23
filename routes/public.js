import express from "express";
import { getProducts } from "../controllers/productController.js";
import { getCategories } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/products", getProducts);
router.get("/categories", getCategories);

export default router;
