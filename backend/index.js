import express from "express";
import cors from "cors";
import fs from "fs";

import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js"; 

//Kreira 'app' instancu ODMAH nakon importova
const app = express();
const PORT = 5000;

//Podešavanje sav middleware (CORS, express.json)
app.use(cors({
  origin: "http://localhost:3000", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"] 
}));

app.use(express.json());

//Povezivanje svih rutere sa njihovim osnovnim putanjama
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes); 

//Inicijalizaciona logika (ako je neophodna ovde)
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});