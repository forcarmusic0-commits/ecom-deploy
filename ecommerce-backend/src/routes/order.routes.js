const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getAllOrders,
} = require("../controllers/order.controller");

router.use(protect);

router.post("/", createOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/pay", updateOrderToPaid);

router.get("/", authorize("admin"), getAllOrders);
router.put("/:id/deliver", authorize("admin"), updateOrderToDelivered);

module.exports = router;
