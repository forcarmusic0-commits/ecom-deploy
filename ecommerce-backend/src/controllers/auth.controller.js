const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/mongo/User");
const ApiError = require("../utils/ApiError");
const sendResponse = require("../utils/ApiResponse");
const { generateTokens, generateAccessToken } = require("../utils/generateTokens");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches refresh token expiry
};

// @route  POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already exists with this email");
  }

  const user = await User.create({ name, email, password });

  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshTokens.push(refreshToken);
  await user.save();

  res.cookie("refreshToken", refreshToken, cookieOptions);
  sendResponse(res, 201, "User registered successfully", {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });
});

// @route  POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshTokens.push(refreshToken);
  await user.save();

  res.cookie("refreshToken", refreshToken, cookieOptions);
  sendResponse(res, 200, "Logged in successfully", {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });
});

// @route  POST /api/auth/refresh
// Reads refresh token from httpOnly cookie, issues a brand new access token
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token provided");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(403, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.refreshTokens.includes(token)) {
    throw new ApiError(403, "Refresh token not recognized (maybe already logged out)");
  }

  const newAccessToken = generateAccessToken(user);
  sendResponse(res, 200, "Access token refreshed", { accessToken: newAccessToken });
});

// @route  POST /api/auth/logout
// Removes the refresh token from DB + clears cookie ("refresh token rotation / revocation")
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await User.updateOne({ refreshTokens: token }, { $pull: { refreshTokens: token } });
  }
  res.clearCookie("refreshToken", cookieOptions);
  sendResponse(res, 200, "Logged out successfully");
});

// @route  GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Current user fetched", { user: req.user });
});

// @route  GET /api/auth/google/callback
// Called after passport.authenticate("google") succeeds - req.user is set by passport
const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshTokens.push(refreshToken);
  await user.save();

  res.cookie("refreshToken", refreshToken, cookieOptions);
  // Redirect back to frontend with the access token (frontend stores it in memory)
  res.redirect(`${process.env.CLIENT_URL}/oauth-success?accessToken=${accessToken}`);
});

module.exports = { register, login, refreshToken, logout, getMe, googleCallback };
