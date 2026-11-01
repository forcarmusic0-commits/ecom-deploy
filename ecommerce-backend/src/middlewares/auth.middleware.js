const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/mongo/User");
const ApiError = require("../utils/ApiError");

// Verifies the access token sent in "Authorization: Bearer <token>"
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, no access token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      throw new ApiError(401, "User no longer exists or is deactivated");
    }
    req.user = user; // attach user to request for downstream controllers
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }
    throw new ApiError(401, "Not authorized, token invalid");
  }
});

module.exports = { protect };
