import productRepository from "../repositories/productRepository.js";
import * as userRepository from "../repositories/userRepository.js";
import { addProductToBuyer } from './userService.js';
import CartService from "./cartService.js";
import CartItemService from "./cartItemService.js";

const cartItemService = new CartItemService();
const cartService = new CartService();

export default {
  _internalGetAll: () => {
    return productRepository.getAllProducts();
  },

  getAll: () => {
    const allProducts = productRepository.getAllProducts();
    const allUsers = userRepository.findAll();

    const blockedUserIds = new Set(
      allUsers.filter(u => u.blokiran === true).map(u => u.id)
    );

    const visibleProducts = allProducts.filter(product => {
      const isHiddenStatus = product.status === 'Sold' || product.status === 'DeletedByAdmin' || product.status === 'Processing';
      const isSellerBlocked = blockedUserIds.has(String(product.prodavacId));

      return !isHiddenStatus && !isSellerBlocked;
    });

    return visibleProducts;
  },

  getOne: (id) => {
    return productRepository.getProductById(id);
  },

  create: (product) => {
    return productRepository.createProduct(product);
  },

  update: (id, data) => {
    return productRepository.updateProduct(id, data);
  },

  deleteLogical: (id) => {
    return productRepository.deleteProduct(id);
  },

  placeBid: (productId, price, userId) => {
    const product = productRepository.getProductById(productId);

    if (!product || product.salesType !== "auction") {
      throw new Error("Product not found or is not an auction.");
    }

    if (product.status !== "Active") {
      throw new Error("Auction for this product is not active.");
    }

    const highestBid = product.ponude?.sort((a, b) => b.cena - a.cena)[0];
    const currentPrice = highestBid ? highestBid.cena : product.price;

    if (price <= parseFloat(currentPrice)) {
      throw new Error("Your bid must be higher than the current price.");
    }

    const newBid = {
      cena: price,
      kupacId: userId,
      datum: new Date().toISOString(),
    };

    if (!product.ponude) {
      product.ponude = [];
    }
    product.ponude.push(newBid);

    return productRepository.updateProduct(productId, product);
  },

  endAuction: (productId, sellerId) => {
    console.log({ productId, sellerId });
    const product = productRepository.getProductById(productId);

    if (!product) {
      throw new Error("Product not found.");
    }
    if (product.prodavacId !== sellerId) {
      throw new Error("You are not authorized to end this auction.");
    }
    if (!product.ponude || product.ponude.length === 0) {
      throw new Error("Cannot end auction with no bids.");
    }

    const winningBid = product.ponude.sort((a, b) => b.cena - a.cena)[0];
    const buyerId = winningBid.kupacId;

    product.status = 'Processing';
    product.kupacId = buyerId;
    product.finalnaCena = winningBid.cena;
    productRepository.updateProduct(productId, product);

    addProductToBuyer(productId, buyerId, sellerId);
    try {
      const buyerCart = cartService.getOrCreateCart(buyerId);

      cartItemService.addItem(buyerCart.id, productId, 1, "IN_PROGRESS");

      console.log(`AUCTION COMPLETED: Created CartItem for product ${productId} in cart ${buyerCart.id} for buyer ${buyerId}`);

    } catch (error) {
      console.error("!!!Error creating CartItem after auction:", error.message);
    }
    return product;
  },

  updateStatus: (productId, newStatus, userId) => {
    console.log(" Service updateStatus called with:", { productId, newStatus, userId });

    const product = productRepository.getProductById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.salesType !== "fixedPrice") {
      throw new Error("Status can only be updated for fixed price products.");
    }

    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (product.status !== "Active") {
      throw new Error("Product is not available anymore.");
    }

    product.status = newStatus;
    product.kupacId = userId;

    console.log("Saving product:", product);
    return productRepository.updateProduct(productId, product);
  },

  cancelPurchase: (productId, userId) => {
    const product = productRepository.getProductById(productId);

    if (!product) {
        throw new Error("Product not found");
    }
    if (String(product.kupacId) !== String(userId)) {
        throw new Error("You can only cancel your own purchases");
    }
    if (product.status !== "Processing") {
        throw new Error("Purchase can only be cancelled if status is Processing");
    }

    product.status = "Active";
    delete product.kupacId;
    productRepository.updateProduct(productId, product);

    try {
        cartItemService.deleteByProductId(productId);
    } catch (error) {
        console.error(`!!! Error deleting item from product cart ${productId}: ${error.message}`);
    }

    return product;
  },

  getSoldProductsBySeller: (sellerId) => {
    const allProducts = productRepository.getAllProducts();
    const soldBySeller = allProducts.filter(p => String(p.prodavacId) === String(sellerId) && p.status === 'Sold');

    const populatedProducts = soldBySeller.map(product => {
      if (product.kupacId) {
        const buyer = userRepository.findById(product.kupacId);
        return {
          ...product,
          kupacKorisnickoIme: buyer ? buyer.korisnickoIme : 'Unknown'
        };
      }
      return product;
    });

    return populatedProducts;
  }
};