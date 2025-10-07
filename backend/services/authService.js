
import * as userRepository from '../repositories/userRepository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CartService from './cartService.js'; 

const cartService = new CartService();

export const register = async (userData) => {
  const { korisnickoIme, email, lozinka } = userData;

  const existingUser =
    userRepository.findByUsername(korisnickoIme) ||
    userRepository.findByEmail(email);

  if (existingUser) {
    throw new Error('Username or email already exists.');
  }

  const hashedPassword = await bcrypt.hash(lozinka, 10);

  const newUser = {
    id: Date.now().toString(),
    ...userData,
    lozinka: hashedPassword,
    proizvodiNaProdaju: [],
    kupljeniProizvodi: []
  };
  
  cartService.getOrCreateCart(newUser.id);
  
  return userRepository.save(newUser);
};

export const login = async (loginData) => {
  const { korisnickoIme, lozinka } = loginData;

  const user = userRepository.findByUsername(korisnickoIme);
  if (!user) {
    throw new Error('Incorrect username or password.');
  }

  if (user.blokiran === true) {
    throw new Error('Your account has been suspended by an administrator.');
  }

  const isMatch = await bcrypt.compare(lozinka, user.lozinka);
  if (!isMatch) {
    throw new Error('Incorrect username or password.');
  }

 const userCart = cartService.getOrCreateCart(user.id);

  const payload = {
    id: user.id,
    uloga: user.uloga,
    korisnickoIme: user.korisnickoIme,
  };

  const token = jwt.sign(payload, 'TVOJA_TAJNA_SIFRA_ZA_TOKEN', {
    expiresIn: '1h',
  });

  return {
    token,
    user: {
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      korisnickoIme: user.korisnickoIme,
      email: user.email,
      uloga: user.uloga,
      telefon: user.telefon || null,
      cartId: userCart.id, 
    },
  };
};