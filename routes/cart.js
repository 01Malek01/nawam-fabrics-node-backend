import express from "express";
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All cart routes are protected
router.use(protect);

// Get current user's cart
router.get("/", getCart);

// Add an item (body: { productId, quantity, meters })
router.post("/", addItemToCart);

// Update an item by itemId id
router.patch("/item/:itemId", updateCartItem);

// Remove an item by itemId id
router.delete("/item/:itemId", removeCartItem);

// Clear cart
router.delete("/", clearCart);

export default router;
