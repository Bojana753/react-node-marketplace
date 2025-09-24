import * as userRepository from '../repositories/userRepository.js';

/**
 * Dohvata podatke o profilu za dati ID korisnika.
 * Izbacuje osetljive podatke kao što je lozinka.
 * @param {string} userId - ID korisnika čiji se profil traži.
 * @returns {object} Objekat sa podacima o korisniku, bez lozinke.
 */
export const getUserProfile = (userId) => {
    // Pozivamo funkciju iz repozitorijuma da pronađe korisnika po ID-ju
    const user = userRepository.findById(userId);

    // Ako korisnik sa tim ID-jem ne postoji, bacamo grešku
    if (!user) {
        throw new Error('Korisnik nije pronađen.');
    }

    // Koristimo "destructuring" sa "rest" operatorom (...) da bismo kreirali
    // novi objekat 'userProfile' koji sadrži SVE propertije iz 'user' objekta,
    // OSIM 'lozinka' propertija.
    const { lozinka, ...userProfile } = user;

    // Vraćamo očišćeni objekat sa podacima profila
    return userProfile;
};


// --- TVOJA NOVA, UNIVERZALNA FUNKCIJA ---

/**
 * Prebacuje vlasništvo nad proizvodom sa prodavca na kupca.
 * @param {string} productId - ID proizvoda koji se prebacuje.
 * @param {string} buyerId - ID kupca.
 * @param {string} sellerId - ID prodavca.
 * @returns {object} Objekat koji potvrđuje uspeh.
 */
export const addProductToBuyer = (productId, buyerId, sellerId) => {
    // Dohvatamo oba korisnika iz "baze"
    const buyer = userRepository.findById(buyerId);
    const seller = userRepository.findById(sellerId);

    // Validacija - proveravamo da li oba korisnika postoje
    if (!buyer || !seller) {
        throw new Error('Kupac ili Prodavac nisu pronađeni.');
    }

    // --- Logika za Kupca ---
    // Ako kupac nema listu kupljenih proizvoda, kreiramo je
    if (!buyer.kupljeniProizvodi) {
        buyer.kupljeniProizvodi = [];
    }
    // Proveravamo da proizvod već nije u listi da izbegnemo duplikate
    if (!buyer.kupljeniProizvodi.includes(productId)) {
        buyer.kupljeniProizvodi.push(productId);
    }

    // --- Logika za Prodavca ---
    // Proveravamo da li prodavac uopšte ima listu proizvoda na prodaju
    if (seller.proizvodiNaProdaju) {
        // Filtriramo listu, izbacujući proizvod koji je prodat
        seller.proizvodiNaProdaju = seller.proizvodiNaProdaju.filter(pId => pId !== productId);
    }

    // Čuvamo izmene za oba korisnika nazad u users.json fajl
    userRepository.save(buyer);
    userRepository.save(seller);

    console.log(`Proizvod ${productId} je prebačen sa prodavca ${sellerId} na kupca ${buyerId}`);
    return { success: true };
};
