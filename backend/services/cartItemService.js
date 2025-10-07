import CartItemRepository from "../repositories/cartItemRepository.js";
import CartItem from "../models/cartItem.js";
import { v4 as uuidv4 } from "uuid";

export default class CartItemService {
  constructor() {
    this.cartItemRepository = new CartItemRepository();
  }

  getAllItems() {
    return this.cartItemRepository.getAll();
  }

  getItemById(id) {
    return this.cartItemRepository.getById(id);
  }

  update(id, data) {
    return this.cartItemRepository.update(id, data);
  }

  getItemsByCartId(cartId) {
    return this.cartItemRepository.getByCartId(cartId);
  }

  addItem(cartId, productId, quantity = 1, status = "IN_PROGRESS") {
    const newItem = new CartItem(uuidv4(), cartId, productId, quantity, status);
    return this.cartItemRepository.create(newItem);
  }

  increaseQuantity(itemId, amount = 1) {
    const item = this.cartItemRepository.getById(itemId);
    if (!item) return null;
    const updatedQuantity = item.quantity + amount;
    return this.cartItemRepository.update(itemId, { quantity: updatedQuantity });
  }

  decreaseQuantity(itemId, amount = 1) {
    const item = this.cartItemRepository.getById(itemId);
    if (!item) return null;
    const updatedQuantity = item.quantity - amount;
    if (updatedQuantity <= 0) {
      this.cartItemRepository.delete(itemId);
      return null;
    }
    return this.cartItemRepository.update(itemId, { quantity: updatedQuantity });
  }

  removeItem(itemId) {
    this.cartItemRepository.delete(itemId);
  }

  deleteByProductId(productId) {
    let allItems = this.cartItemRepository.getAll();
    const initialLength = allItems.length;

    const remainingItems = allItems.filter(item => String(item.productId) !== String(productId));

    if (remainingItems.length < initialLength) {
       this.cartItemRepository.saveAll(remainingItems);
      console.log(`Successfully deleted cart item(s) for product ID: ${productId}`);
      return true;
    }

    console.warn(`No cart item found to delete for product ID: ${productId}`);
    return false;
  }
}