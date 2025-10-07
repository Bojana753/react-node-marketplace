import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../css/PublicProfilePage.css';

async function fetchPublicProfile(userId) {
    const token = localStorage.getItem('token');
    const headers = {}; 

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`http://localhost:5000/api/users/${userId}`, { headers }); 
    if (!res.ok) throw new Error('User not found.');
    return res.json();
}

export default function PublicProfilePage() {
    const { userId } = useParams(); 
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            setProfile(null);
            setError('');
            setLoading(true);
            try {
                const data = await fetchPublicProfile(userId);
                setProfile(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [userId]);

     if (loading) return <div className="public-profile-page"><div className="container text-center"><h2>Loading Profile...</h2></div></div>;
    if (error) return <div className="public-profile-page"><div className="container"><h2 className="text-danger">{error}</h2></div></div>;
    if (!profile) return <div className="public-profile-page"><div className="container"><h2>Profile not found.</h2></div></div>;

    const StarRating = ({ rating }) => '★'.repeat(Math.round(rating)).padEnd(5, '☆');

    return (
        <div className="public-profile-page">
            <div className="container">

                <div className="profile-header-card">
                    <img 
                        src={profile.profilnaSlika || '/default-profile.png'} 
                         alt={`${profile.korisnickoIme}'s profile`} 
                        className="profile-header-avatar" 
                    />
                    <div className="profile-header-info">
                        <h1>{profile.korisnickoIme}</h1>
                        <span className="role-badge">{profile.uloga}</span>
                        <div className="profile-header-stats">
                            <span className="stat-item">
                                <strong>Average Rating:</strong> <StarRating rating={profile.prosjecnaOcjena} /> ({profile.prosjecnaOcjena.toFixed(1)})
                            </span>
                        </div>
                        <p className="mt-2">{profile.opis || 'User has not provided a description.'}</p>
                    </div>
                </div>

                {profile.uloga === 'Prodavac' && (
                    <div className="products-section">
                        <h2 className="section-title">Products for Sale</h2>
                        <div className="row">
                            {profile.proizvodiNaProdaju && profile.proizvodiNaProdaju.length > 0 ? (
                                profile.proizvodiNaProdaju.map(product => (
                                    <div key={product.id} className="col-lg-4 col-md-6 mb-4">
                                        <div className="card h-100">
                                            <img src={product.image} className="card-img-top" alt={product.name} style={{height: '200px', objectFit: 'cover'}} />
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title">{product.name}</h5>
                                                <p className="card-text">${product.price}</p>
                                                <Link to={`/products/${product.id}`} className="btn btn-primary mt-auto">
                                                    View Product
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center">This seller has no active products.</p>
                            )}
                        </div>
                    </div>
                )}
                
                {profile.uloga === 'Kupac' && (
                    <div className="products-section">
                        <h2 className="section-title">Purchase History</h2>
                        <div className="row">
                            {profile.kupljeniProizvodi && profile.kupljeniProizvodi.length > 0 ? (
                                profile.kupljeniProizvodi.map(product => (
                                    <div key={product.id} className="col-lg-4 col-md-6 mb-4">
                                        <div className="card h-100">
                                            <img src={product.image} className="card-img-top" alt={product.name} style={{height: '200px', objectFit: 'cover'}} />
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title">{product.name}</h5>
                                                <p className="card-text text-success">Purchased</p>
                                                
                                                <Link to={`/products/${product.id}`} className="btn btn-secondary mt-auto">
                                                    View Product
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center">This user has no public purchase history.</p>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="reviews-section mt-5">
                    <h2 className="section-title">Reviews Received ({profile.recenzije.length})</h2>
                    {profile.recenzije && profile.recenzije.length > 0 ? (
                        profile.recenzije.map(review => (
                            <div key={review.id} className="review-card">
                                <div className="card-body">
                                    <h5 className="card-title"><StarRating rating={review.ocjena} /></h5>
                                    <p className="card-text">"{review.komentar}"</p>
                                    <footer className="blockquote-footer">
                                        Posted by
                                        <Link to={`/profile/${review.authorId}`}>
                                            <cite title="Source Title">{review.authorUsername}</cite>
                                        </Link>
                                    </footer>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center">This user has no reviews yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}