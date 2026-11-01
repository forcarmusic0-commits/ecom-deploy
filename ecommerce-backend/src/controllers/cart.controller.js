const asyncHandler = require("express-async-handler");
const Cart = require("../models/mongo/Cart");
const Product = require("../models/mongo/Product");
const ApiError = require("../utils/ApiError");
const sendResponse = require("../utils/ApiResponse");

// @route GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name price images stock"
  );
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  sendResponse(res, 200, "Cart fetched", { cart });
});

// @route POST /api/cart
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.stock < quantity) throw new ApiError(400, "Not enough stock available");

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, quantity, price: product.discountPrice || product.price });
  }

  await cart.save();
  await cart.populate("items.product", "name price images stock");
  sendResponse(res, 200, "Item added to cart", { cart });
});

// @route PUT /api/cart/:productId
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  const item = cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) throw new ApiError(404, "Item not found in cart");

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product", "name price images stock");
  sendResponse(res, 200, "Cart item updated", { cart });
});

// @route DELETE /api/cart/:productId
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  sendResponse(res, 200, "Item removed from cart", { cart });
});

// @route DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  sendResponse(res, 200, "Cart cleared");
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
