
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import '../css/MyPurchases.css'; 

async function getMySalesAPI(token) {
    const res = await fetch('http://localhost:5000/api/products/my-sales', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch sold products.");
    return res.json();
}

async function postReviewAPI(reviewData, token) {
    const res = await fetch('http://localhost:5000/api/reviews', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify(reviewData) 
    });
    if (!res.ok) { const errData = await res.json(); throw new Error(errData.message || "Failed to post review."); }
    return res.json();
}

async function postReportAPI(reportData, token) {
    const res = await fetch('http://localhost:5000/api/reports', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify(reportData) 
    });
    if (!res.ok) { const errData = await res.json(); throw new Error(errData.message || "Failed to post report."); }
    return res.json();
}

export default function MySales() {
    const { user } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedProductForReview, setSelectedProductForReview] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedProductForReport, setSelectedProductForReport] = useState(null);
    const [reportReason, setReportReason] = useState('');

    const loadSales = useCallback(async () => {
        if (!user || user.uloga !== 'Prodavac') return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const mySoldProducts = await getMySalesAPI(token);
            setSales(mySoldProducts);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadSales();
    }, [loadSales]);

    const openReviewModal = (product) => {
        setSelectedProductForReview(product);
        setRating(0);
        setComment('');
        setIsReviewModalOpen(true);
    };
    const closeReviewModal = () => setIsReviewModalOpen(false);

    const handleReviewSubmit = async () => {
        if (rating === 0) {
            alert("Please select a rating (1-5).");
            return;
        }
        const token = localStorage.getItem('token');
        const reviewData = {
            ocjena: rating,
            komentar: comment,
            productId: selectedProductForReview.id,
            receiverId: selectedProductForReview.kupacId 
        };
        try {
            await postReviewAPI(reviewData, token);
            alert("Review submitted successfully!");
            closeReviewModal();
            loadSales(); 
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

     const openReportModal = (product) => { 
        setSelectedProductForReport(product); 
        setReportReason(''); 
        setIsReportModalOpen(true); 
    };
    const closeReportModal = () => { 
        setIsReportModalOpen(false); 
        setSelectedProductForReport(null); 
    };
    const handleReportSubmit = async () => {
        if (reportReason.trim() === '') { 
            alert("Please enter a reason for the report."); 
            return; 
        }
        const token = localStorage.getItem('token');
        const reportData = { 
            razlog: reportReason, 
            productId: selectedProductForReport.id 
        };
        try {
            await postReportAPI(reportData, token);
            alert("Report sent to administrator for review.");
            closeReportModal();
        } catch (err) { 
            alert(`Error: ${err.message}`); 
        }
    };

    if (loading) return <h2>Loading your sales...</h2>;
    
    return (
        <div className="purchases-page">
            <div className="container">
                <h2>My Sales</h2>
                {error && <p className="alert alert-danger">{error}</p>}
                
                {sales.length > 0 ? (
                    sales.map(product => (
                        <div key={product.id} className="purchase-card">
                            <img src={product.image || '/placeholder.png'} alt={product.name} className="purchase-image" />
                            <div className="purchase-details">
                                <h3>{product.name}</h3>
                                <div className="purchase-info">
                                    <span>Status: <strong className="text-danger">{product.status}</strong></span>
                                    <span className="mx-3">|</span>
                                    <span>Sold to: <strong>{product.kupacKorisnickoIme || 'N/A'}</strong></span>
                                </div>
                                <div className="purchase-actions">
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={() => openReviewModal(product)}
                                        disabled={!product.kupacId} 
                                    >
                                        Rate Buyer
                                    </button>
                                   <button 
                                        className="btn btn-outline-danger" 
                                        onClick={() => openReportModal(product)}
                                        disabled={!product.kupacId}
                                    >
                                        Report Buyer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center">You have no completed sales yet.</p>
                )}
            </div>

            {isReviewModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h3>Rate buyer for "{selectedProductForReview.name}"</h3>
                        <div className="rating-stars">{[1, 2, 3, 4, 5].map(star => (<span key={star} className={star <= rating ? 'star-filled' : 'star-empty'} onClick={() => setRating(star)}>★</span>))}</div>
                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Your comment (optional)..." />
                        <div className="modal-buttons">
                            <button onClick={handleReviewSubmit}>Submit Review</button>
                            <button onClick={closeReviewModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {isReportModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h3>Report buyer for "{selectedProductForReport.name}"</h3>
                        <textarea 
                            value={reportReason} 
                            onChange={(e) => setReportReason(e.target.value)} 
                            placeholder="Enter the reason for the report (e.g., product not paid, user unresponsive...)" 
                        />
                        <div className="modal-buttons">
                            <button onClick={handleReportSubmit}>Send Report</button>
                            <button onClick={closeReportModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}