require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/mongo/User");
const Category = require("../models/mongo/Category");
const Product = require("../models/mongo/Product");

const demoCategories = [
  { name: "Demo Electronics", description: "Demo electronics for trying the shop." },
  { name: "Demo Home", description: "Demo home goods for trying the shop." },
  { name: "Demo Accessories", description: "Demo accessories for trying the shop." },
];

const demoProducts = [
  {
    name: "Demo Wireless Headphones",
    description: "Over-ear wireless headphones with clear sound and a comfortable fit.",
    price: 79.99,
    discountPrice: 69.99,
    stock: 25,
    category: "Demo Electronics",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"],
  },
  {
    name: "Demo Smart Speaker",
    description: "A compact smart speaker for music, podcasts, and everyday listening.",
    price: 59.99,
    discountPrice: 0,
    stock: 18,
    category: "Demo Electronics",
    images: ["https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=800&q=80"],
  },
  {
    name: "Demo Desk Lamp",
    description: "An adjustable desk lamp with a clean, modern design.",
    price: 34.99,
    discountPrice: 29.99,
    stock: 30,
    category: "Demo Home",
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"],
  },
  {
    name: "Demo Ceramic Planter",
    description: "A simple ceramic planter to add greenery to your desk or living space.",
    price: 22.5,
    discountPrice: 0,
    stock: 40,
    category: "Demo Home",
    images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80"],
  },
  {
    name: "Demo Everyday Backpack",
    description: "A lightweight backpack with useful storage for daily essentials.",
    price: 49.99,
    discountPrice: 44.99,
    stock: 20,
    category: "Demo Accessories",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"],
  },
  {
    name: "Demo Stainless Water Bottle",
    description: "A reusable stainless-steel bottle for everyday hydration.",
    price: 19.99,
    discountPrice: 0,
    stock: 50,
    category: "Demo Accessories",
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80"],
  },
];

const getOrCreateAdmin = async () => {
  const name = process.env.DEMO_ADMIN_NAME?.trim();
  const email = process.env.DEMO_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.DEMO_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Set DEMO_ADMIN_NAME, DEMO_ADMIN_EMAIL, and DEMO_ADMIN_PASSWORD before seeding."
    );
  }
  if (password.length < 12) {
    throw new Error("DEMO_ADMIN_PASSWORD must be at least 12 characters.");
  }

  let admin = await User.findOne({ email });
  if (admin) {
    if (admin.role !== "admin") {
      throw new Error(
        `An account with DEMO_ADMIN_EMAIL (${email}) already exists but is not an admin. No role was changed.`
      );
    }
    console.log(`Admin already exists: ${email}`);
    return admin;
  }

  admin = await User.create({ name, email, password, role: "admin" });
  console.log(`Created demo admin: ${email}`);
  return admin;
};

const seedDemoData = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to seed demo data.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const admin = await getOrCreateAdmin();
  const categoriesByName = new Map();

  for (const data of demoCategories) {
    let category = await Category.findOne({ name: data.name });
    if (!category) {
      category = await Category.create(data);
      console.log(`Created category: ${category.name}`);
    }
    categoriesByName.set(category.name, category);
  }

  let createdProducts = 0;
  for (const data of demoProducts) {
    const existing = await Product.findOne({ name: data.name });
    if (existing) continue;

    await Product.create({
      ...data,
      category: categoriesByName.get(data.category)._id,
      seller: admin._id,
    });
    createdProducts += 1;
  }

  console.log(`Demo seed complete. Added ${createdProducts} product(s).`);
};

seedDemoData()
  .catch((error) => {
    console.error(`Demo seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
