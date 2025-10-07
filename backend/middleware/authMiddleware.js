import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository.js';

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, 'TVOJA_TAJNA_SIFRA_ZA_TOKEN');
      
      const currentUser = userRepository.findById(decoded.id);
      if (!currentUser) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = { 
        id: decoded.id || decoded.userId, 
        ...decoded 
      };
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.uloga === 'Administrator') {
        next(); // Korisnik je admin, nastavi dalje
    } else {
        res.status(403).json({ message: 'Not authorized as an administrator' }); // 403 Forbidden
    }
};

// ==========================================================
// === NOVI KOD JE DODAT ISPOD, POSTOJEĆI NIJE PROMENJEN ===
// ==========================================================

export const optionalProtect = (req, res, next) => {
    let token;

    // Proveravamo da li token uopšte postoji u headeru
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Pokušavamo da izvučemo i verifikujemo token, isto kao u 'protect' funkciji
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, 'TVOJA_TAJNA_SIFRA_ZA_TOKEN');
            
            // Pronalazimo korisnika, ali ne prekidamo ako ga ne nađemo
            const currentUser = userRepository.findById(decoded.id);
            if (currentUser) {
                 // Ako je korisnik pronađen, dodajemo ga u request objekat
                req.user = {
                    id: decoded.id || decoded.userId,
                    ...decoded
                };
            } else {
                // Ako korisnik sa tim ID-jem više ne postoji, tretiramo ga kao da nije ulogovan
                req.user = null;
            }

        } catch (error) {
            // Ako je token neispravan (istekao, loš potpis),
            // ne bacamo grešku, već samo postavljamo da korisnik nije ulogovan.
            console.error('Optional protect: Token verification failed, continuing as guest:', error.message);
            req.user = null;
        }
    }
    
    // U SVAKOM SLUČAJU NASTAVLJAMO DALJE
    // Bilo da je korisnik uspešno postavljen na req.user, ili je req.user ostao null.
    next();
};