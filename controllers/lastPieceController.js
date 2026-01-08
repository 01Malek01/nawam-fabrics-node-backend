import AppError from "../utils/AppError.js";
import LastPiece from "../models/LastPiece.js";
import Product from "../models/Product.js";
import fs from "fs";
import path from "path";

// Create last piece
export async function createLastPiece(req, res, next) {
  try {
    const { name, length, price, product, category } = req.body;
    const image =
      req.files && req.files.length > 0 ? req.files[0].path : undefined;

    let productId = product;
    // if no product id provided, create a new Product from last-piece data
    if (!productId) {
      const prod = new Product({
        Name: name,
        PricePerMeter: price ?? 0,
        Description: "",
        Image: image ? [image] : [],
        MainCategory: category ?? undefined,
        SubCategory: category ?? undefined,
        stock: { meters: length ?? 0 },
      });
      await prod.save();
      productId = prod._id;
    }

    const lp = new LastPiece({
      name,
      length,
      price,
      image,
      product: productId,
      category,
    });
    await lp.save();
    res.status(201).json(lp);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Get all last pieces
export async function getLastPieces(req, res, next) {
  try {
    // Filters: category and allowed lengths (3, 3.25, 3.5, 4)
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const allowedLengths = [3, 3.25, 3.5, 4];
    if (req.query.length) {
      // accept single value or comma-separated list
      const requested = String(req.query.length)
        .split(",")
        .map((s) => parseFloat(s))
        .filter((n) => !isNaN(n) && allowedLengths.includes(n));
      if (requested.length === 1) {
        filter.length = requested[0];
      } else if (requested.length > 1) {
        filter.length = { $in: requested };
      }
      // if none valid, ignore length filter
    }

    const lastPieces = await LastPiece.find(filter)
      .populate("category")
      .populate("product")
      .sort({ createdAt: -1 });
    res.json(lastPieces);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Get single last piece
export async function getLastPiece(req, res, next) {
  try {
    const lp = await LastPiece.findById(req.params.id)
      .populate("category")
      .populate("product");
    if (!lp) return next(new AppError("LastPiece not found", 404));
    res.json(lp);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Update last piece
export async function updateLastPiece(req, res, next) {
  try {
    const { name, length, price, product, category } = req.body;
    const lp = await LastPiece.findById(req.params.id);
    if (!lp) return next(new AppError("LastPiece not found", 404));

    // handle image replacement
    if (req.files && req.files.length > 0) {
      const newImage = req.files[0].path;
      // remove old file if inside uploads
      try {
        if (lp.image) {
          const imgPath = path.isAbsolute(lp.image)
            ? lp.image
            : path.join(process.cwd(), lp.image);
          const uploadsDir = path.join(process.cwd(), "uploads");
          const relative = path.relative(uploadsDir, imgPath);
          if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          }
        }
      } catch (e) {
        console.warn("Failed removing lastpiece image:", e.message);
      }
      lp.image = newImage;
    }

    lp.name = name ?? lp.name;
    lp.length = length ?? lp.length;
    lp.price = price ?? lp.price;
    lp.product = product ?? lp.product;
    lp.category = category ?? lp.category;

    await lp.save();
    res.json(lp);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Delete last piece
export async function deleteLastPiece(req, res, next) {
  try {
    const lp = await LastPiece.findById(req.params.id);
    if (!lp) return next(new AppError("LastPiece not found", 404));

    // remove image file
    try {
      if (lp.image) {
        const imgPath = path.isAbsolute(lp.image)
          ? lp.image
          : path.join(process.cwd(), lp.image);
        const uploadsDir = path.join(process.cwd(), "uploads");
        const relative = path.relative(uploadsDir, imgPath);
        if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }
      }
    } catch (e) {
      console.warn("Failed removing lastpiece image:", e.message);
    }

    await LastPiece.findByIdAndDelete(req.params.id);
    res.json({ message: "LastPiece deleted" });
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}
