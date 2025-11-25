import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
    },
    PricePerMeter: {
      type: Number,
      required: true,
    },
    Description: {
      type: String,
      required: false,
    },
    Image: [
      {
        type: String,
      },
    ],
    SubCategory: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Category",
    },
    MainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Category",
    },
    VideoUrl: {
      type: String,
      required: false,
    },
    MostSold: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
