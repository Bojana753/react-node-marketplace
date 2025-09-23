import productRepository from "../repositories/productRepository.js";
import * as userRepository from "../repositories/userRepository.js";
import { addProductToBuyer } from './userService.js'; 

export default {
  getAll: () => {
    return productRepository.getAllProducts();
  },

  getOne: (id) => {
    return productRepository.getProductById(id);
  },

  create: (product) => {
    return productRepository.createProduct(product); // 👈 koristiš createProduct
  },

  update: (id, data) => {
    return productRepository.updateProduct(id, data);
  },

  deleteLogical: (id) => {
    return productRepository.deleteProduct(id);
  },
  placeBid: (productId, price, userId) => {
    const product = productRepository.getProductById(productId);
    
    // Validacija 1: Proveri da li proizvod postoji i da li je na aukciji
    if (!product || product.salesType !== 'auction') { // Proveravamo 'salesType' polje
      throw new Error('Product not found or is not an auction.');
    }

    // Validacija 2: Proveri da li je aukcija već završena (npr. prodat)
    if (product.status !== 'Active') { // Mnogo jednostavnije
  throw new Error('Auction for this product is not active.');
}

    // Pronalazimo trenutnu najvišu ponudu
    const highestBid = product.ponude?.sort((a, b) => b.cena - a.cena)[0];
    const currentPrice = highestBid ? highestBid.cena : product.price;

    // Validacija 3: Proveri da li je nova ponuda veća
    if (price <= parseFloat(currentPrice)) {
      throw new Error('Your bid must be higher than the current price.');
    }

    const newBid = {
      cena: price,
      kupacId: userId,
      datum: new Date().toISOString()
    };

    // Inicijalizuj 'ponude' niz ako ne postoji
    if (!product.ponude) {
      product.ponude = [];
    }
    product.ponude.push(newBid);
    
    // Čuvamo ceo izmenjeni proizvod nazad u "bazu"
    return productRepository.updateProduct(productId, product);
  },

  /**
   * Završava aukciju za proizvod.
   */
endAuction: (productId, sellerId) => {
    const product = productRepository.getProductById(productId);
    // ... sve tvoje validacije za proizvod, vlasnika i ponude ostaju ISTE ...
    if (!product) { /*...*/ }
    if (product.prodavacId !== sellerId) { /*...*/ }
    if (!product.ponude || product.ponude.length === 0) { /*...*/ }

    const winningBid = product.ponude.sort((a, b) => b.cena - a.cena)[0];
    const buyerId = winningBid.kupacId;

    // Ažuriramo proizvod
    product.status = 'Processing'; // Menjamo status u "Obrada"
    product.kupacId = buyerId;
    product.finalnaCena = winningBid.cena;
    productRepository.updateProduct(productId, product);

    // === POZIVAMO NAŠU NOVU, UNIVERZALNU FUNKCIJU ===
    // Prosleđujemo joj sve potrebne informacije
    addProductToBuyer(productId, buyerId, sellerId);
    
    return product;
}
};
