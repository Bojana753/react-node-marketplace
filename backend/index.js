import express from "express";
import cors from "cors";
import fs from "fs";

// tvoje postojeće rute
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/userRoutes.js";

// nova cart ruta
import cartRoutes from "./routes/cartRoutes.js";
import cartItemRoutes from "./routes/cartItemRoutes.js";
import userRoutes from "./routes/userRoutes.js"; 

const app = express();
const PORT = 5000;

// ✅ Middleware (CORS + JSON)
app.use(cors({
  origin: "http://localhost:3000", 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // dodali PATCH i OPTIONS
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ✅ omogući preflight za sve rute
app.options(/.*/, cors());

app.use(express.json());

// ✅ Rute
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/cart-items", cartItemRoutes)
app.use("/api/users", userRoutes); 

// ✅ Inicijalizacija kategorija ako ne postoje
const CATEGORIES_FILE = "./data/categories.json";
if (!fs.existsSync(CATEGORIES_FILE)) {
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data", { recursive: true });
  }
  const categories = [
    { name: "Electronics" },
    { name: "Clothing" },
    { name: "Books" }
  ];
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), "utf8");
}

// ✅ Pokretanje servera
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
