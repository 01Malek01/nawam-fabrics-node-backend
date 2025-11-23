import Category from "../models/Category.js";
import AppError from "../utils/AppError.js";

// Create category
export async function createCategory(req, res) {
  try {
    const { Name, ParentCategory, Image } = req.body;
    const imagePath = req.file ? req.file.path : Image;
    const category = new Category({ Name, ParentCategory, Image: imagePath });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Get all categories
export async function getCategories(req, res) {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Get single category
export async function getCategory(req, res) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new AppError("Category not found", 404));
    res.json(category);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Update category
export async function updateCategory(req, res) {
  try {
    const { Name, ParentCategory, Image } = req.body;
    const imagePath = req.file ? req.file.path : Image;
    const update = { Name, ParentCategory, Image: imagePath };
    const category = await Category.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!category) return next(new AppError("Category not found", 404));
    res.json(category);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Delete category
export async function deleteCategory(req, res) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new AppError("Category not found", 404));
    res.json({ message: "Category deleted" });
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}
