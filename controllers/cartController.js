import AppError from "../utils/AppError.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import LastPiece from "../models/LastPiece.js";

export async function getCart(req, res, next) {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
    );
    res.json({ cart: cart || { items: [] } });
  } catch (err) {
    next(new AppError(err.message || "خطأ في الخادم", 500));
  }
}

export async function addItemToCart(req, res, next) {
  const { productId, quantity = 1, meters = 1, images } = req.body;
  if (!productId) return next(new AppError("productId is required", 400));
  try {
    let product = await Product.findById(productId);
    let lastPiece = null;
    if (!product) {
      // try last pieces if product not found
      lastPiece = await LastPiece.findById(productId);
      if (!lastPiece) return next(new AppError("المنتج غير موجود", 404));
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }
    const itemId = product ? product._id : lastPiece.product;
    // Always add a new cart item (allow duplicates of the same product).
    cart.items.push({
      product: itemId,
      quantity: Number(quantity),
      meters: Number(meters) || (lastPiece ? (lastPiece.length ?? 1) : 1),
      pricePerMeter: product
        ? (product.PricePerMeter ?? 0)
        : (lastPiece.price ?? 0),
      images: images
        ? images
        : product
          ? (product.Image ?? [])
          : [lastPiece.image].filter(Boolean),
    });

    await cart.save();
    await cart.populate("items.product");
    res.status(200).json({ cart });
  } catch (err) {
    next(new AppError(err.message || "خطأ في الخادم", 500));
  }
}

export async function updateCartItem(req, res, next) {
  const { itemId } = req.params;
  const { quantity, meters } = req.body;
  if (!productId) return next(new AppError("productId is required", 400));
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return next(new AppError("عربة التسوق غير موجودة", 404));

    const item = cart.items.find((it) => it._id.equals(itemId));
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
  const { itemId } = req.params;
  if (!itemId) return next(new AppError("itemId is required", 400));
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return next(new AppError("عربة التسوق غير موجودة", 404));
    cart.items = cart.items.filter((it) => !it._id.equals(itemId));
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
