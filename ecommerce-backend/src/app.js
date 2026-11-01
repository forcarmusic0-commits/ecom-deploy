const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const adminRoutes = require("./routes/admin.routes");
const chatRoutes = require("./routes/chat.routes");
const path = require("path");

const app = express();

// ---- global middlewares ----
const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(passport.initialize());

// ---- health check ----
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// ---- routes ----
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

// ---- serve frontend ----
app.use(express.static(path.join(__dirname, "../../", "ecommerce-frontend", "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../", "ecommerce-frontend", "dist", "index.html"));
});


// ---- error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

module.exports = app;
