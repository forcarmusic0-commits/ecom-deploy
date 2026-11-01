const asyncHandler = require("express-async-handler");
const Product = require("../models/mongo/Product");
const Review = require("../models/mongo/Review");
const ApiError = require("../utils/ApiError");
const sendResponse = require("../utils/ApiResponse");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Partial match, plus one optional extra character between letters
// so "monste" matches "Monstera" and a small typo still hits.
const keywordMatcher = (raw) => {
  const term = String(raw).trim().slice(0, 40);
  if (!term) return null;

  const fuzzy = [...term].map((char) => escapeRegex(char)).join(".{0,1}");
  return { $regex: fuzzy, $options: "i" };
};

// @route POST /api/products  (seller/admin)
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, discountPrice, stock, images, category } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    discountPrice,
    stock,
    images,
    category,
    seller: req.user._id,
  });

  sendResponse(res, 201, "Product created", { product });
});

// @route GET /api/products
// Supports: ?keyword=monste&category=<id>&minPrice=100&maxPrice=5000&page=1&limit=10&sort=price
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

  const filter = { isActive: true };
  const matcher = keyword ? keywordMatcher(keyword) : null;
  if (matcher) {
    filter.$or = [{ name: matcher }, { description: matcher }];
  }
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortOption = {};
  if (sort === "price_asc") sortOption.price = 1;
  else if (sort === "price_desc") sortOption.price = -1;
  else if (sort === "rating") sortOption.ratings = -1;
  else sortOption.createdAt = -1;

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .populate("seller", "name avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  sendResponse(res, 200, "Products fetched", { products }, {
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit),
    },
  });
});

// @route GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .populate("seller", "name avatar email")
    .populate({
      path: "reviews",
      populate: { path: "user", select: "name avatar" }, // nested populate
    });

  if (!product) throw new ApiError(404, "Product not found");
  sendResponse(res, 200, "Product fetched", { product });
});

// @route PUT /api/products/:id  (seller who owns it, or admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "You do not own this product");
  }

  Object.assign(product, req.body);
  await product.save();
  sendResponse(res, 200, "Product updated", { product });
});

// @route DELETE /api/products/:id  (seller who owns it, or admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "You do not own this product");
  }

  await Review.deleteMany({ product: product._id });
  await product.deleteOne();
  sendResponse(res, 200, "Product deleted");
});

// @route POST /api/products/:id/reviews
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const review = await Review.create({
    user: req.user._id,
    product: product._id,
    rating,
    comment,
  });

  product.reviews.push(review._id);

  // recalculate average rating
  const allReviews = await Review.find({ product: product._id });
  product.numReviews = allReviews.length;
  product.ratings = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

  await product.save();
  sendResponse(res, 201, "Review added", { review });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addReview,
};
