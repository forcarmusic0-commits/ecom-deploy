const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  toggleUserActive,
  deleteAnyProduct,
} = require("../controllers/admin.controller");

router.use(protect, authorize("admin")); // everything here is admin-only

router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/deactivate", toggleUserActive);
router.delete("/products/:id", deleteAnyProduct);

module.exports = router;
