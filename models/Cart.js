import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    quantity: {
      type: Number,
      default: 1,
    },
    meters: {
      // how many meters of this fabric the user wants
      type: Number,
      default: 1,
    },
    pricePerMeter: {
      // snapshot of product price at time of adding to cart
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
