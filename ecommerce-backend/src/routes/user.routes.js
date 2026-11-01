const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  getProfile,
  updateProfile,
  changePassword,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/user.controller");

router.use(protect); // every route below requires login

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.post("/wishlist/:productId", addToWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);

module.exports = router;
