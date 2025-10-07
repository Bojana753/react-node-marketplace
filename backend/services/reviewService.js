import { v4 as uuidv4 } from 'uuid';
import * as reviewRepository from '../repositories/reviewRepository.js';
import * as productRepository from '../repositories/productRepository.js';
import * as userRepository from '../repositories/userRepository.js';
import Review from '../models/review.js';

export const createReview = (reviewData, authorId) => {
    const { ocjena, komentar, productId, receiverId } = reviewData;

    
    const product = productRepository.default.getProductById(productId);
    if (!product) {
        throw new Error("Product not found.");
    }
    if (product.status !== 'Sold') {
        throw new Error("It is possible to leave a review only for sold products.");
    }

    const isBuyer = String(product.kupacId) === String(authorId);
    const isSeller = String(product.prodavacId) === String(authorId);

    if (!isBuyer && !isSeller) {
        throw new Error('You cannot rate a transaction in which you did not participate.');
    }

    if (isBuyer && String(product.prodavacId) !== String(receiverId)) {
        throw new Error('As a customer, you can only rate the seller of this product.');
    }
    if (isSeller && String(product.kupacId) !== String(receiverId)) {
        throw new Error('As a seller, you can only rate the buyer of this product.');
    }

     const existingReview = reviewRepository.findByProductIdAndAuthorId(productId, authorId);
    if (existingReview) {
        throw new Error("You have already rated this transaction.");
    }

    const newReview = new Review(
        uuidv4(),
        ocjena,
        komentar,
        productId,
        authorId,
        receiverId,
        new Date().toISOString()
    );

    return reviewRepository.save(newReview);
};

export const getAllReviews = () => {
    const reviews = reviewRepository.findAll();
    const users = userRepository.findAll();

    const usersMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {});

    const populatedReviews = reviews.map(review => {
        const author = usersMap[review.authorId];
        const receiver = usersMap[review.receiverId];

        return {
            ...review,
            authorUsername: author ? author.korisnickoIme : 'Unknown',
            receiverUsername: receiver ? receiver.korisnickoIme : 'Unknown'
        };
    });

    return populatedReviews;
};

export const updateReview = (reviewId, newComment) => {
    const review = reviewRepository.findById(reviewId);
    if (!review) {
        throw new Error("No review found.");
    }
    review.komentar = newComment;
    return reviewRepository.save(review);
};

export const deleteReview = (reviewId) => {
    const success = reviewRepository.deleteById(reviewId);
    if (!success) {
        throw new Error("No review found for deletion.");
    }
    return { message: "Review successfully deleted." };
};