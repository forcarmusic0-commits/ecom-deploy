const asyncHandler = require("express-async-handler");
const User = require("../models/mongo/User");
const Product = require("../models/mongo/Product");
const Order = require("../models/mongo/Order");
const ApiError = require("../utils/ApiError");
const sendResponse = require("../utils/ApiResponse");

// @route GET /api/admin/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalProducts, totalOrders, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]),
  ]);

  sendResponse(res, 200, "Dashboard stats fetched", {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: revenueAgg[0]?.totalRevenue || 0,
  });
});

// @route GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshTokens");
  sendResponse(res, 200, "All users fetched", { users });
});

// @route PUT /api/admin/users/:id/role
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["user", "seller", "admin"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  sendResponse(res, 200, "User role updated", { user });
});

// @route PUT /api/admin/users/:id/deactivate
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  user.isActive = !user.isActive;
  await user.save();
  sendResponse(res, 200, `User ${user.isActive ? "activated" : "deactivated"}`, { user });
});

// @route DELETE /api/admin/products/:id  -> admin can remove any product
const deleteAnyProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  sendResponse(res, 200, "Product deleted by admin");
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  toggleUserActive,
  deleteAnyProduct,
};
