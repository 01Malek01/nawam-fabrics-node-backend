import Category from "../models/Category.js";
import AppError from "../utils/AppError.js";

// Create category
export async function createCategory(req, res) {
  try {
    const { Name, ParentCategory, Image, isSubCategory } = req.body;
    const imagePath = req.file ? req.file.path : Image;
    const category = new Category({
      Name,
      ParentCategory,
      Image: imagePath,
      isSubCategory,
    });
    if (isSubCategory && !ParentCategory) {
      return next(new AppError("Subcategory must have a ParentCategory", 400));
    }
    if (isSubCategory === true) {
      const parentCategory = await Category.findById(ParentCategory);
      if (!parentCategory) {
        return next(new AppError("ParentCategory not found", 404));
      }
      parentCategory.subCategories.push(category._id);
      await parentCategory.save();
    }
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Get all categories
export async function getCategories(req, res) {
  try {
    const categories = await Category.find()
      .populate("ParentCategory")
      .populate("subCategories");
    res.json(categories);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Get single category
export async function getCategory(req, res) {
  try {
    const category = await Category.findById(req.params.id).populate(
      "ParentCategory"
    );
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
    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) return next(new AppError("Category not found", 404));
    const imagePath = req.file
      ? req.file.path
      : Image || existingCategory.Image;
    const update = { Name, ParentCategory, Image: imagePath };
    const category = await Category.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (ParentCategory) {
      const parentCategory = await Category.findById(ParentCategory);
      if (!parentCategory) {
        return next(new AppError("ParentCategory not found", 404));
      }
      if (!parentCategory.subCategories.includes(category._id)) {
        parentCategory.subCategories.push(category._id);
        await parentCategory.save();
      }
    }
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
