const asyncHandler = require("express-async-handler");
const Order = require("../models/mongo/Order");
const Cart = require("../models/mongo/Cart");
const Product = require("../models/mongo/Product");
const ApiError = require("../utils/ApiError");
const sendResponse = require("../utils/ApiResponse");

// @route POST /api/orders   -> builds an order from the user's current cart
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) throw new ApiError(400, "Cart is empty");

  // validate stock and build order items
  const orderItems = [];
  let itemsPrice = 0;

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${item.product.name}`);
    }
    orderItems.push({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
    });
    itemsPrice += item.price * item.quantity;
  }

  const taxPrice = Number((itemsPrice * 0.05).toFixed(2)); // 5% tax, simple example
  const shippingPrice = itemsPrice > 1000 ? 0 : 50;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  // decrement stock for each product
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
  }

  // empty the cart
  cart.items = [];
  await cart.save();

  sendResponse(res, 201, "Order placed successfully", { order });
});

// @route GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("orderItems.product", "name images")
    .sort({ createdAt: -1 });
  sendResponse(res, 200, "Your orders fetched", { orders });
});

// @route GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("orderItems.product", "name images price");

  if (!order) throw new ApiError(404, "Order not found");

  // only the owner or an admin can view it
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to view this order");
  }

  sendResponse(res, 200, "Order fetched", { order });
});

// @route PUT /api/orders/:id/pay
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = "processing";
  await order.save();
  sendResponse(res, 200, "Order marked as paid", { order });
});

// @route PUT /api/orders/:id/deliver  (admin)
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.status = "delivered";
  await order.save();
  sendResponse(res, 200, "Order marked as delivered", { order });
});

// @route GET /api/orders  (admin) -> all orders in the system
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  sendResponse(res, 200, "All orders fetched", { orders });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getAllOrders,
};
