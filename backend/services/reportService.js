import { v4 as uuidv4 } from 'uuid';
import * as reportRepository from '../repositories/reportRepository.js';
import * as productRepository from '../repositories/productRepository.js';
import * as userRepository from '../repositories/userRepository.js';
import Report from '../models/report.js';

export const createReport = (reportData, reporterId) => {
    const { razlog, productId } = reportData;

    if (!razlog || razlog.trim() === '') {
        throw new Error("The reason for registration is required.");
    }

    const product = productRepository.default.getProductById(productId);
    if (!product) {
        throw new Error("Product not found.");
    }
    
    const isBuyer = String(product.kupacId) === String(reporterId);
    const isSeller = String(product.prodavacId) === String(reporterId);
    
    if (!isBuyer && !isSeller) {
        throw new Error('You cannot report a transaction in which you did not participate.');
    }

    let reportedUserId;
    if (isBuyer) {
        reportedUserId = product.prodavacId;
    } else {
        reportedUserId = product.kupacId;
    }
    
    const newReport = new Report(
        uuidv4(),
        razlog,
        productId,
        reporterId,
        reportedUserId, 
        new Date().toISOString(),
        "Filed" 
    );

    return reportRepository.save(newReport);
};

export const getAllReports = () => {
    const reports = reportRepository.findAll();
    const users = userRepository.findAll(); 

    const usersMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {});

    const populatedReports = reports.map(report => {
        const reporter = usersMap[report.reporterId];
        const reported = usersMap[report.reportedId];

        return {
            ...report, 
            reporterUsername: reporter ? reporter.korisnickoIme : 'Unknown User',
            reportedUsername: reported ? reported.korisnickoIme : 'Unknown User'
        };
    });

    return populatedReports;
};

export const acceptReport = (reportId) => {
    const report = reportRepository.findById(reportId); 
    if (!report) {
        throw new Error("Login not found.");
    }
    if (report.status !== 'Filed') {
        throw new Error("This application has already been processed.");
    }

    const userToBlock = userRepository.findById(report.reportedId);
    if (userToBlock) {
        userToBlock.blokiran = true;
        userRepository.save(userToBlock);
    }

    const allProducts = productRepository.default.getAllProducts();
    const updatedProducts = allProducts.map(p => {
        if (String(p.prodavacId) === String(report.reportedId) && p.status === 'Active') {
            return { ...p, status: 'DeletedByAdmin' }; 
        }
        return p;
    });
    productRepository.default.saveProducts(updatedProducts); 

    report.status = 'Accepted';
    return reportRepository.save(report);
};

export const rejectReport = (reportId, reason) => {
    const report = reportRepository.findById(reportId); 
    if (!report) {
        throw new Error("Login not found.");
    }
    if (report.status !== 'Filed') {
        throw new Error("This application has already been processed.");
    }
    
    report.status = 'Rejected';
    report.rejectionReason = reason; 
    return reportRepository.save(report);
};