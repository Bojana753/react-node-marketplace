import * as userRepository from '../repositories/userRepository.js';
import bcrypt from 'bcrypt';
import productRepository from '../repositories/productRepository.js';
import * as reviewRepository from '../repositories/reviewRepository.js';

export const getUserProfile = (userId) => {
    const user = userRepository.findById(userId);
    if (!user) {
        throw new Error('User not found.');
    }
    const { lozinka, ...userProfile } = user;

    return userProfile;
};

export const addProductToBuyer = (productId, buyerId, sellerId) => {

    const buyer = userRepository.findById(buyerId);
    const seller = userRepository.findById(sellerId);

    if (!buyer || !seller) {
        throw new Error('No buyer or seller found.');
    }

    if (!buyer.kupljeniProizvodi) {
        buyer.kupljeniProizvodi = [];
    }
 
    if (!buyer.kupljeniProizvodi.includes(productId)) {
        buyer.kupljeniProizvodi.push(productId);
    }

    if (seller.proizvodiNaProdaju) {
        seller.proizvodiNaProdaju = seller.proizvodiNaProdaju.filter(pId => pId !== productId);
    }

    userRepository.save(buyer);
    userRepository.save(seller);

    console.log(`Product ${productId} has been transferred from seller ${sellerId} to customer${buyerId}`);
    return { success: true };
};

export const updateBasicProfile = (userId, basicData) => {
    const user = userRepository.findById(userId);
    if (!user) {
        throw new Error('User not found.');
    }

    const allowedFields = ['ime', 'prezime', 'telefon', 'datumRodjenja', 'opis', 'profilnaSlika'];
    
    const dataToUpdate = {};
    for (const key of Object.keys(basicData)) {
        if (allowedFields.includes(key)) {
            dataToUpdate[key] = basicData[key];
        }
    }

    const updatedUser = userRepository.save({ ...user, ...dataToUpdate });
    const { lozinka, ...userProfile } = updatedUser;
    return userProfile;
};

export const updateSensitiveProfile = async (userId, sensitiveData) => {
    const { currentPassword, newUsername, newEmail, newPassword } = sensitiveData;

    if (!currentPassword) {
        throw new Error('Current password is required.');
    }

    const user = userRepository.findById(userId);
    if (!user) {
        throw new Error('User not found.');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.lozinka);
    if (!isMatch) {
        throw new Error('The current password you entered is incorrect.');
    }

    const dataToUpdate = {};

    if (newUsername && newUsername !== user.korisnickoIme) {
        if (userRepository.findByUsername(newUsername)) {
            throw new Error('This username is already taken.');
        }
        dataToUpdate.korisnickoIme = newUsername;
    }

    if (newEmail && newEmail !== user.email) {
        if (userRepository.findByEmail(newEmail)) {
            throw new Error('This email address is already in use.');
        }
        dataToUpdate.email = newEmail;
    }

    if (newPassword) {
        dataToUpdate.lozinka = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(dataToUpdate).length === 0) {
        const { lozinka, ...userProfile } = user;
        return userProfile;
    }

    const updatedUser = userRepository.save({ ...user, ...dataToUpdate });
    const { lozinka, ...userProfileWithoutPassword } = updatedUser;
    return userProfileWithoutPassword;
};


export const getPublicProfile = (profileUserId, viewerId) => {
    const user = userRepository.findById(profileUserId);
    if (!user) {
        throw new Error('User not found.');
    }
    
    const { lozinka, ...userProfile } = user;

    const allProducts = productRepository.getAllProducts();
    if (user.uloga === 'Prodavac') {
        userProfile.proizvodiNaProdaju = allProducts.filter(p => 
            String(p.prodavacId) === String(profileUserId) && p.status === 'Active'
        );
    } else if (user.uloga === 'Kupac') {
        userProfile.kupljeniProizvodi = allProducts.filter(p =>
            String(p.kupacId) === String(profileUserId) && p.status === 'Sold'
        );
    }

    const allReviews = reviewRepository.findAll();
    let receivedReviews = allReviews.filter(r => String(r.receiverId) === String(profileUserId));

    if (profileUserId === viewerId && user.uloga === 'Prodavac') {
        const givenReviews = allReviews.filter(r => String(r.authorId) === String(profileUserId));
        const reviewedBuyerIds = new Set(givenReviews.map(r => r.receiverId));
        receivedReviews = receivedReviews.filter(r => reviewedBuyerIds.has(String(r.authorId)));
    }
    
    const populatedReviews = receivedReviews.map(review => {
        const author = userRepository.findById(review.authorId);
        return {
            ...review,
            authorUsername: author ? author.korisnickoIme : 'Unknown'
        };
    });
    userProfile.recenzije = populatedReviews;

    if (receivedReviews.length > 0) {
        const totalRating = receivedReviews.reduce((sum, review) => sum + review.ocjena, 0);
        userProfile.prosjecnaOcjena = totalRating / receivedReviews.length;
    } else {
        userProfile.prosjecnaOcjena = 0;
    }

    return userProfile;
};