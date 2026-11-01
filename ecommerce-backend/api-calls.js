/**
 * Run every HTTP API against the local server.
 * Usage: node api-calls.js
 * Server must already be running on http://localhost:5000
 *
 * Google login is browser-only, so that route is printed and not followed.
 * The script promotes the new user to admin so seller and admin routes can run.
 */
require("dotenv").config();
const mongoose = require("mongoose");

const BASE = process.env.API_BASE || "http://localhost:5000";
const password = "secret123";
const email = `demo.${Date.now()}@local.test`;

let accessToken = "";
let refreshCookie = "";

async function call(name, method, path, { body, auth = true, cookie = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (cookie && refreshCookie) headers.Cookie = refreshCookie;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const setCookies = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  const refresh = setCookies.find((c) => c.startsWith("refreshToken="));
  if (refresh) refreshCookie = refresh.split(";")[0];

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }

  const ok = res.status < 400;
  console.log(`\n${ok ? "OK" : "FAIL"} ${res.status} ${method} ${path} — ${name}`);
  console.log(typeof json === "string" ? json.slice(0, 400) : JSON.stringify(json, null, 2).slice(0, 800));
  if (!ok) throw new Error(`${name} failed (${res.status})`);
  return json;
}

async function main() {
  await call("health", "GET", "/api/health", { auth: false });

  const registered = await call("register", "POST", "/api/auth/register", {
    auth: false,
    body: { name: "Demo User", email, password },
  });
  accessToken = registered.data.accessToken;
  const userId = registered.data.user.id;

  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.collection("users").updateOne(
    { _id: new mongoose.Types.ObjectId(userId) },
    { $set: { role: "admin" } }
  );
  await mongoose.disconnect();
  console.log("\nPromoted demo user to admin so seller/admin routes succeed.");

  await call("login", "POST", "/api/auth/login", {
    auth: false,
    body: { email, password },
  }).then((json) => {
    accessToken = json.data.accessToken;
  });

  await call("refresh access token", "POST", "/api/auth/refresh", { auth: false, cookie: true });
  await call("current user", "GET", "/api/auth/me");

  const category = await call("create category", "POST", "/api/categories", {
    body: { name: `Phones ${Date.now()}`, description: "Mobile phones", image: "" },
  });
  const categoryId = category.data.category._id;

  await call("list categories", "GET", "/api/categories", { auth: false });
  await call("get category", "GET", `/api/categories/${categoryId}`, { auth: false });
  await call("update category", "PUT", `/api/categories/${categoryId}`, {
    body: { description: "Smartphones and accessories" },
  });

  const product = await call("create product", "POST", "/api/products", {
    body: {
      name: "Demo Phone",
      description: "Sample product created by api-calls.js",
      price: 19999,
      discountPrice: 17999,
      stock: 10,
      images: ["https://example.com/phone.jpg"],
      category: categoryId,
    },
  });
  const productId = product.data.product._id;

  await call("list products", "GET", `/api/products?keyword=Demo&minPrice=1000&maxPrice=50000&page=1&limit=10&sort=price`, { auth: false });
  await call("get product", "GET", `/api/products/${productId}`, { auth: false });
  await call("update product", "PUT", `/api/products/${productId}`, {
    body: { stock: 8, discountPrice: 16999 },
  });
  await call("add review", "POST", `/api/products/${productId}/reviews`, {
    body: { rating: 5, comment: "Works well" },
  });

  await call("get profile", "GET", "/api/users/profile");
  await call("update profile", "PUT", "/api/users/profile", {
    body: {
      name: "Demo User",
      phone: "9999999999",
      avatar: "",
      addresses: [{ label: "Home", street: "MG Road", city: "Pune", state: "MH", zip: "411001", country: "India" }],
    },
  });
  await call("add wishlist", "POST", `/api/users/wishlist/${productId}`);
  await call("remove wishlist", "DELETE", `/api/users/wishlist/${productId}`);

  await call("add to cart", "POST", "/api/cart", { body: { productId, quantity: 1 } });
  await call("get cart", "GET", "/api/cart");
  await call("update cart qty", "PUT", `/api/cart/${productId}`, { body: { quantity: 2 } });

  const order = await call("place order", "POST", "/api/orders", {
    body: {
      paymentMethod: "COD",
      shippingAddress: { street: "MG Road", city: "Pune", state: "MH", zip: "411001", country: "India" },
    },
  });
  const orderId = order.data.order._id;

  await call("my orders", "GET", "/api/orders/my");
  await call("get order", "GET", `/api/orders/${orderId}`);
  await call("mark paid", "PUT", `/api/orders/${orderId}/pay`);
  await call("all orders (admin)", "GET", "/api/orders");
  await call("mark delivered (admin)", "PUT", `/api/orders/${orderId}/deliver`);

  await call("empty cart after order", "GET", "/api/cart");
  await call("add to cart again", "POST", "/api/cart", { body: { productId, quantity: 1 } });
  await call("remove cart item", "DELETE", `/api/cart/${productId}`);
  await call("add to cart for clear", "POST", "/api/cart", { body: { productId, quantity: 1 } });
  await call("clear cart", "DELETE", "/api/cart");

  const room = await call("create chat room", "POST", "/api/chat/rooms", {
    body: { sellerId: userId, productId },
  });
  const roomId = room.data.room.id;
  await call("my chat rooms", "GET", "/api/chat/rooms");
  await call("room messages", "GET", `/api/chat/rooms/${roomId}/messages`);

  await call("admin dashboard", "GET", "/api/admin/dashboard");
  await call("admin users", "GET", "/api/admin/users");
  await call("admin set role", "PUT", `/api/admin/users/${userId}/role`, { body: { role: "admin" } });

  await call("change password", "PUT", "/api/users/change-password", {
    body: { currentPassword: password, newPassword: "secret456" },
  });

  await call("logout", "POST", "/api/auth/logout", { auth: false, cookie: true });

  console.log("\nGoogle OAuth (open in a browser, not called here):");
  console.log(`${BASE}/api/auth/google`);
  console.log("\nLogin after this script:");
  console.log(JSON.stringify({ email, password: "secret456" }, null, 2));
  console.log("\nAll API calls finished.");
}

main().catch((err) => {
  console.error("\nStopped:", err.message);
  process.exit(1);
});
