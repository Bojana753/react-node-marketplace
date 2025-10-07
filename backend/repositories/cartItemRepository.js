import fs from "fs";

export default class CartItemRepository {
  constructor(filePath = "./data/cartItems.json") {
    this.filePath = filePath;
  }

  _loadItems() {
    const data = fs.readFileSync(this.filePath, "utf-8");
    return JSON.parse(data);
  }

  _saveItems(items) {
    fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2));
  }

  getAll() {
    return this._loadItems();
  }

  getById(id) {
    return this._loadItems().find(item => item.id === id);
  }

  getByCartId(cartId) {
    return this._loadItems().filter(item => item.cartId === cartId);
  }

  create(item) {
    const items = this._loadItems();
    items.push(item);
    this._saveItems(items);
    return item;
  }

  update(id, updatedItem) {
    let items = this._loadItems();
    items = items.map(item => (item.id === id ? { ...item, ...updatedItem } : item));
    this._saveItems(items);
    return this.getById(id);
  }

  delete(id) {
    let items = this._loadItems();
    items = items.filter(item => item.id !== id);
    this._saveItems(items);
  }

 saveAll(items) {
    this._saveItems(items);
  }
}