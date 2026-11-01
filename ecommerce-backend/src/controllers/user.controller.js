const asyncHandler = require("express-async-handler");
const User = require("../models/mongo/User");
const ApiError = require("../utils/ApiError");
const sendResponse = require("../utils/ApiResponse");

// @route GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  // populate wishlist so the frontend gets full product objects, not just ids
  const user = await User.findById(req.user._id).populate("wishlist", "name price images ratings");
  sendResponse(res, 200, "Profile fetched", { user });
});

// @route PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar, addresses } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;
  if (addresses) user.addresses = addresses;

  await user.save();
  sendResponse(res, 200, "Profile updated", { user });
});

// @route PUT /api/users/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword; // pre-save hook will hash it
  await user.save();
  sendResponse(res, 200, "Password changed successfully");
});

// @route POST /api/users/wishlist/:productId
const addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.wishlist.includes(req.params.productId)) {
    user.wishlist.push(req.params.productId);
    await user.save();
  }
  sendResponse(res, 200, "Added to wishlist", { wishlist: user.wishlist });
});

// @route DELETE /api/users/wishlist/:productId
const removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
  await user.save();
  sendResponse(res, 200, "Removed from wishlist", { wishlist: user.wishlist });
});

module.exports = { getProfile, updateProfile, changePassword, addToWishlist, removeFromWishlist };
