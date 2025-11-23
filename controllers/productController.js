import AppError from "../utils/AppError.js";
// Update product video
export async function updateProductVideo(req, res) {
  try {
    const productId = req.params.id;
    const videoFile = req.file;
    if (!videoFile || !videoFile.mimetype.startsWith("video/")) {
      return next(new AppError("No video file uploaded", 400));
    }
    const product = await Product.findByIdAndUpdate(
      productId,
      { VideoUrl: videoFile.path },
      { new: true }
    );
    if (!product) return next(new AppError("Product not found", 404));
    res.json(product);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}
import Product from "../models/Product.js";

// Create product
export async function createProduct(req, res) {
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
export async function getProducts(req, res) {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Get single product
export async function getProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError("Product not found", 404));
    res.json(product);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Update product
export async function updateProduct(req, res) {
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
    const update = {
      Name,
      PricePerMeter,
      Description,
      Image: images,
      SubCategory,
      MainCategory,
      VideoUrl: videos[0] || VideoUrl,
      MostSold,
    };
    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!product) return next(new AppError("Product not found", 404));
    res.json(product);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Delete product
export async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(new AppError("Product not found", 404));
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}
