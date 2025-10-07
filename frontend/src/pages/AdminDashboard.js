import React, { useState, useEffect, useCallback } from 'react';
import '../css/ReviewModal.css'; 
import '../css/AdminDashboard.css';

async function fetchReports(token) {
    const res = await fetch('/api/reports', { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw new Error("Failed to fetch reports");
    return res.json();
}
async function acceptReportAPI(reportId, token) {
    const res = await fetch(`/api/reports/${reportId}/accept`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
    return res.json();
}
async function rejectReportAPI(reportId, reason, token) {
    const res = await fetch(`/api/reports/${reportId}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ reason }) });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
    return res.json();
}
async function fetchReviews(token) {
    const res = await fetch('/api/reviews', { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw new Error("Failed to fetch reviews");
    return res.json();
}
async function deleteReviewAPI(reviewId, token) {
    const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
    return res.json();
}
async function updateReviewAPI(reviewId, newComment, token) {
    const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ komentar: newComment })
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
    return res.json();
}

export default function AdminDashboard() {
    const [reports, setReports] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State za modal odbijanja prijave
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // State za modal izmjene recenzije
    const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);
    const [selectedReviewForEdit, setSelectedReviewForEdit] = useState(null);
    const [newCommentText, setNewCommentText] = useState('');

    const loadData = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            setLoading(true);
            setError(''); 
            const reportsData = await fetchReports(token);
            const reviewsData = await fetchReviews(token);
            setReports(reportsData);
            setReviews(reviewsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { 
        loadData(); 
    }, [loadData]);

    const handleAccept = async (reportId) => {
        if (!window.confirm("Are you sure? This will block the user and delete their products.")) return;
        const token = localStorage.getItem('token');
        try {
            await acceptReportAPI(reportId, token);
            alert("Report accepted. User has been blocked.");
            loadData(); 
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };
    
    const openRejectModal = (report) => {
        setSelectedReport(report);
        setIsRejectModalOpen(true);
        setRejectionReason('');
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) { alert("Please enter a reason."); return; }
        const token = localStorage.getItem('token');
        try {
            await rejectReportAPI(selectedReport.id, rejectionReason, token);
            alert("Report rejected.");
            setIsRejectModalOpen(false);
            loadData(); 
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        const token = localStorage.getItem('token');
        try {
            await deleteReviewAPI(reviewId, token);
            alert("Review deleted.");
            loadData(); 
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const openEditReviewModal = (review) => {
        setSelectedReviewForEdit(review);
        setNewCommentText(review.komentar);
        setIsEditReviewModalOpen(true);
    };

    const closeEditReviewModal = () => {
        setIsEditReviewModalOpen(false);
        setSelectedReviewForEdit(null);
        setNewCommentText('');
    };

    const handleEditReviewSubmit = async () => {
        const token = localStorage.getItem('token');
        try {
            await updateReviewAPI(selectedReviewForEdit.id, newCommentText, token);
            alert("Review comment updated successfully.");
            closeEditReviewModal();
            loadData();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    if (loading) return <h2>Loading...</h2>;

    return (
        <div className="admin-dashboard">
            <div className="container">
                <h1 className="mb-4">Admin Dashboard</h1>
                {error && <p className="alert alert-danger">{error}</p>}
                
                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">Report Management</div>
                        <div className="dashboard-card-body">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Reported by</th>
                                        <th>Reported User</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(report => (
                                        <tr key={report.id}>
                                            <td>{report.reporterUsername}</td>
                                            <td>{report.reportedUsername}</td>
                                            <td>{report.razlog}</td>
                                            <td><span className={`badge ${report.status === 'Podneta' ? 'bg-warning' : (report.status === 'Prihvaćena' ? 'bg-success' : 'bg-secondary')}`}>{report.status}</span></td>
                                            <td>
                                                {report.status === 'Podneta' && (
                                                    <>
                                                        <button className="btn btn-sm btn-success me-2" onClick={() => handleAccept(report.id)}>Accept</button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => openRejectModal(report)}>Reject</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {reports.length === 0 && <p className="empty-state">No reports found.</p>}
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="dashboard-card-header">Review Management</div>
                        <div className="dashboard-card-body">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Author</th>
                                        <th>Receiver</th>
                                        <th>Rating</th>
                                        <th>Comment</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map(review => (
                                        <tr key={review.id}>
                                            <td>{review.authorUsername}</td>
                                            <td>{review.receiverUsername}</td>
                                            <td>{'★'.repeat(review.ocjena).padEnd(5, '☆')}</td>
                                            <td>{review.komentar}</td>
                                            <td>
                                                <button className="btn btn-sm btn-warning me-2" onClick={() => openEditReviewModal(review)}>Edit</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteReview(review.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {reviews.length === 0 && <p className="empty-state">No reviews found.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {isRejectModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h3>Reason for Rejection</h3>
                        <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Enter reason..." />
                        <div className="modal-buttons">
                            <button onClick={handleRejectSubmit}>Confirm Rejection</button>
                            <button onClick={() => setIsRejectModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {isEditReviewModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h3>Edit Review Comment</h3>
                        <p><strong>Rating:</strong> {'★'.repeat(selectedReviewForEdit.ocjena).padEnd(5, '☆')} (cannot be changed)</p>
                        <textarea 
                            value={newCommentText} 
                            onChange={(e) => setNewCommentText(e.target.value)}
                            rows="5"
                        />
                        <div className="modal-buttons">
                            <button onClick={handleEditReviewSubmit}>Save Changes</button>
                            <button onClick={closeEditReviewModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}