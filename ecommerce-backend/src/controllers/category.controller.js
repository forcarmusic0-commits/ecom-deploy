const asyncHandler = require("express-async-handler");
const Category = require("../models/mongo/Category");
const ApiError = require("../utils/ApiError");
const sendResponse = require("../utils/ApiResponse");

// @route POST /api/categories  (admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parent, image } = req.body;
  const category = await Category.create({ name, description, parent, image });
  sendResponse(res, 201, "Category created", { category });
});

// @route GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  // populate parent so nested categories show parent name directly
  const categories = await Category.find().populate("parent", "name slug");
  sendResponse(res, 200, "Categories fetched", { categories });
});

// @route GET /api/categories/:id
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate("parent", "name slug");
  if (!category) throw new ApiError(404, "Category not found");
  sendResponse(res, 200, "Category fetched", { category });
});

// @route PUT /api/categories/:id  (admin)
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new ApiError(404, "Category not found");
  sendResponse(res, 200, "Category updated", { category });
});

// @route DELETE /api/categories/:id  (admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");
  sendResponse(res, 200, "Category deleted");
});

module.exports = { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };
