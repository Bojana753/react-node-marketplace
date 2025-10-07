import productService from "../services/productService.js";
import fs from "fs";

const PRODUCTS_FILE = "./data/products.json";

export default {
  getAll: (req, res) => {
    res.json(productService.getAll());
  },
  getMyPurchases: (req, res) => {
    console.log(`--- Received request for 'getMyPurchases' from user ID: ${req.user.id}`);
    try {
      const allProducts = productService._internalGetAll();
      const userId = req.user.id;

      const myPurchases = allProducts.filter(p =>
        (p.status === 'Sold' || p.status === 'Processing') && String(p.kupacId) === String(userId)
      );
      console.log(` Found ${myPurchases.length} of purchased products. I am sending a reply.`);
      res.json(myPurchases);
    } catch (error) {
      console.error(`!!! Error in 'getMyPurchases'': ${error.message}`);
      res.status(500).json({ message: "Error fetching purchase history." });
    }
  },

  getOne: (req, res) => {
    try {
      const product = productService.getOne(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  create: (req, res) => {
    try {
      const productData = {
        ...req.body,
        prodavacId: req.user.id,
        status: "Active",
      };

      const newProduct = productService.create(productData);
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  update: (req, res) => {
    try {
      const updated = productService.update(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  deleteLogical: (req, res) => {
    try {
      const result = productService.deleteLogical(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  placeBid: async (req, res) => {
    try {
      const productId = req.params.id;
      const { price } = req.body;
      const userId = req.user.id;

      const updatedProduct = await productService.placeBid(
        productId,
        parseFloat(price),
        userId
      );

      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  endAuction: async (req, res) => {
    try {
      const productId = req.params.id;
      const sellerId = req.user.id;

      const updatedProduct = await productService.endAuction(
        productId,
        sellerId
      );

      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateStatus: (req, res) => {
    try {
      const { status } = req.body;
      const userId = req.user?.id;

      const updatedProduct = productService.updateStatus(
        req.params.id,
        status,
        userId
      );

      res.json(updatedProduct);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  getMine: (req, res) => {
    try {
      const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
      const myProducts = products.filter(
        (p) =>
          String(p.prodavacId) === String(req.user.id) &&
          p.status !== "Sold" &&
          p.status !== "approved"
      );
      res.json(myProducts);
    } catch (err) {
      res.status(500).json({ message: "Failed to load your products" });
    }
  },
  getForSellerApproval: (req, res) => {
    try {
      const allProducts = productService._internalGetAll();
      const sellerId = req.user.id;

      const forApproval = allProducts.filter(p =>
        p.status === 'Processing' && String(p.prodavacId) === String(sellerId)
      );
      res.json(forApproval);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products for approval." });
    }
  },

  cancelPurchase: (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user.id;

        const updatedProduct = productService.cancelPurchase(productId, userId);

        res.json({ message: "Purchase cancelled", product: updatedProduct });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
  },

  getMySoldProducts: async (req, res) => {
    try {
      const sellerId = req.user.id;
      const soldProducts = productService.getSoldProductsBySeller(sellerId);
      res.json(soldProducts);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },
};