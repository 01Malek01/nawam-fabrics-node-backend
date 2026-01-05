import AppError from "../utils/AppError.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export async function getCart(req, res, next) {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    res.json({ cart: cart || { items: [] } });
  } catch (err) {
    next(new AppError(err.message || "خطأ في الخادم", 500));
  }
}

export async function addItemToCart(req, res, next) {
  const { productId, quantity = 1, meters = 1 } = req.body;
  if (!productId) return next(new AppError("productId is required", 400));
  try {
    const product = await Product.findById(productId);
    if (!product) return next(new AppError("المنتج غير موجود", 404));

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingIndex = cart.items.findIndex((it) =>
      it.product.equals(product._id)
    );
    if (existingIndex > -1) {
      // update existing item: set meters and increase quantity
      cart.items[existingIndex].quantity += Number(quantity);
      cart.items[existingIndex].meters = Number(meters);
      // refresh images snapshot from product
      cart.items[existingIndex].images = product.Image ?? [];
    } else {
      cart.items.push({
        product: product._id,
        quantity: Number(quantity),
        meters: Number(meters),
        pricePerMeter: product.PricePerMeter ?? 0,
        images: product.Image ?? [],
      });
    }

    await cart.save();
    await cart.populate("items.product");
    res.status(200).json({ cart });
  } catch (err) {
    next(new AppError(err.message || "خطأ في الخادم", 500));
  }
}

export async function updateCartItem(req, res, next) {
  const { productId } = req.params;
  const { quantity, meters } = req.body;
  if (!productId) return next(new AppError("productId is required", 400));
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return next(new AppError("عربة التسوق غير موجودة", 404));

    const item = cart.items.find((it) => it.product.equals(productId));
    if (!item) return next(new AppError("العنصر غير موجود في العربة", 404));
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (meters !== undefined) item.meters = Number(meters);

    // remove if quantity is zero or less
    cart.items = cart.items.filter((it) => it.quantity > 0);

    await cart.save();
    await cart.populate("items.product");
    res.json({ cart });
  } catch (err) {
    next(new AppError(err.message || "خطأ في الخادم", 500));
  }
}

export async function removeCartItem(req, res, next) {
  const { productId } = req.params;
  if (!productId) return next(new AppError("productId is required", 400));
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return next(new AppError("عربة التسوق غير موجودة", 404));
    cart.items = cart.items.filter((it) => !it.product.equals(productId));
    await cart.save();
    await cart.populate("items.product");
    res.json({ cart });
  } catch (err) {
    next(new AppError(err.message || "خطأ في الخادم", 500));
  }
}

export async function clearCart(req, res, next) {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: "Cart cleared" });
  } catch (err) {
    next(new AppError(err.message || "خطأ في الخادم", 500));
  }
}
