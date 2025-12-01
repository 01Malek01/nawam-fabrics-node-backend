import AppError from "../utils/AppError.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// Create product
export async function createProduct(req, res, next) {
  try {
    const {
      Name,
      PricePerMeter,
      Description,
      SubCategory,
      MainCategory,
      VideoUrl,
      MostSold,
    } = req.body;
    const images = req.files
      ? req.files
          .filter((f) => f.mimetype.startsWith("image/"))
          .map((f) => f.path)
      : [];
    const videos = req.files
      ? req.files
          .filter((f) => f.mimetype.startsWith("video/"))
          .map((f) => f.path)
      : [];
    const product = new Product({
      Name,
      PricePerMeter,
      Description,
      Image: images,
      SubCategory,
      MainCategory,
      VideoUrl: videos[0] || VideoUrl,
      MostSold,
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Get all products
export async function getProducts(req, res, next) {
  try {
    const { category, subcategory, sort, order } = req.query;

    let match = {};
    if (category) match.MainCategory = new mongoose.Types.ObjectId(category);
    if (subcategory)
      match.SubCategory = new mongoose.Types.ObjectId(subcategory);

    let sortObj = {};
    if (sort) {
      const sortField = sort === "price" ? "PricePerMeter" : sort;
      const sortOrder = order === "desc" ? -1 : 1;
      sortObj[sortField] = sortOrder;
    } else {
      sortObj.createdAt = -1; // default sort by newest
    }

    const products = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "MainCategory",
          foreignField: "_id",
          as: "mainCategory",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "SubCategory",
          foreignField: "_id",
          as: "subCategory",
        },
      },

      { $match: match },
      { $sort: sortObj },
      {
        $project: {
          Name: 1,
          PricePerMeter: 1,
          Description: 1,
          Image: 1,
          SubCategory: 1,
          MainCategory: 1,
          VideoUrl: 1,
          MostSold: 1,
          createdAt: 1,
          updatedAt: 1,
          mainCategoryName: { $arrayElemAt: ["$mainCategory.Name", 0] },
          subCategoryName: { $arrayElemAt: ["$subCategory.Name", 0] },
        },
      },
    ]);

    res.json(products);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Get single product
export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id)
      .populate("MainCategory")
      .populate("SubCategory");
    if (!product) return next(new AppError("Product not found", 404));
    res.json(product);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Update product
export async function updateProduct(req, res, next) {
  try {
    const {
      Name,
      PricePerMeter,
      Description,
      SubCategory,
      MainCategory,
      VideoUrl,
      MostSold,
    } = req.body;
    let images = [];
    let videos = [];
    if (req.files && req.files.length > 0) {
      images = req.files
        .filter((f) => f.mimetype.startsWith("image/"))
        .map((f) => f.path);
      videos = req.files
        .filter((f) => f.mimetype.startsWith("video/"))
        .map((f) => f.path);
    }
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) return next(new AppError("Product not found", 404));
    const update = {
      Name,
      PricePerMeter,
      Description,
      Image:
        images.length > 0
          ? [...existingProduct.Image, ...images]
          : existingProduct.Image,
      SubCategory,
      MainCategory,
      VideoUrl: videos.length > 0 ? videos[0] : existingProduct.VideoUrl,
      MostSold,
    };
    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    res.json(product);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Delete product
export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(new AppError("Product not found", 404));
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

export const deleteProductImage = async (req, res, next) => {
  try {
    const { productId, imageIndex } = req.params;
    const product = await Product.findById(productId);
    if (!product) return next(new AppError("Product not found", 404));
    if (imageIndex < 0 || imageIndex >= product.Image.length) {
      return next(new AppError("Image index out of bounds", 400));
    }
    product.Image.splice(imageIndex, 1);
    await product.save();
    res.json(product);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
};
