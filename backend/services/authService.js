// src/services/authService.js
import * as userRepository from '../repositories/userRepository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (userData) => {
  const { korisnickoIme, email, lozinka } = userData;

  // Provera da li korisnik već postoji
  const existingUser =
    userRepository.findByUsername(korisnickoIme) ||
    userRepository.findByEmail(email);

  if (existingUser) {
    throw new Error('Korisničko ime ili email već postoje.');
  }

  // Hesiranje lozinke
  const hashedPassword = await bcrypt.hash(lozinka, 10);

  // Kreiranje novog korisnika
  const newUser = {
    id: Date.now().toString(), // Jednostavan unique ID
    ...userData,
    lozinka: hashedPassword,
    // Ako želiš default:
    // uloga: 'Kupac',
    proizvodiNaProdaju: [],
    kupljeniProizvodi: []
  };

  return userRepository.save(newUser);
};

export const login = async (loginData) => {
  const { korisnickoIme, lozinka } = loginData;

  const user = userRepository.findByUsername(korisnickoIme);
  if (!user) {
    throw new Error('Pogrešno korisničko ime ili lozinka.');
  }

  const isMatch = await bcrypt.compare(lozinka, user.lozinka);
  if (!isMatch) {
    throw new Error('Pogrešno korisničko ime ili lozinka.');
  }

  // Kreiranje tokena
  const payload = {
    id: user.id,
    uloga: user.uloga,
    korisnickoIme: user.korisnickoIme,
  };

  const token = jwt.sign(payload, 'TVOJA_TAJNA_SIFRA_ZA_TOKEN', {
    expiresIn: '1h',
  });

  // Vrati token i podatke o user-u (bez lozinke!)
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
    },
  };
};
