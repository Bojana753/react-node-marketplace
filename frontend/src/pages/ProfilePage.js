import React, { useState, useEffect } from 'react';
import { getMyProfile } from '../services/userService';
import { getProduct } from '../services/productService'; // Pretpostavka da ova funkcija postoji
import '../css/ProfilePage.css'; // Kreiraćemo ovaj fajl

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfileData(data);

        // Ako korisnik ima kupljene proizvode, dohvati njihove detalje
        if (data.kupljeniProizvodi && data.kupljeniProizvodi.length > 0) {
          // Promise.all nam omogućava da čekamo da se svi API pozivi završe
          const productPromises = data.kupljeniProizvodi.map(id => getProduct(id));
          const resolvedProducts = await Promise.all(productPromises);
          setPurchasedProducts(resolvedProducts);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profileData) {
    return <div className="error-state">Could not load your profile. Please log in again.</div>;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">My Profile</h1>
        
        <div className="profile-card">
          <h2>{profileData.ime} {profileData.prezime}</h2>
          <p><strong>Username:</strong> {profileData.korisnickoIme}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
          <p><strong>Phone:</strong> {profileData.telefon}</p>
          <p><strong>Role:</strong> {profileData.uloga}</p>
          {/* Ovde kasnije može doći dugme za izmenu profila */}
        </div>

        <div className="products-section">
          <h2>My Purchased Products</h2>
          {purchasedProducts.length > 0 ? (
            <ul className="product-grid">
              {purchasedProducts.map(product => (
                <li key={product.id} className="product-card">
                  {/* Možemo iskoristiti stilove iz product.css */}
                  <h3>{product.name}</h3>
                  <p className="product-price">Paid: ${product.finalnaCena || product.price}</p>
                  <p>Status: {product.status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>You haven't purchased any products yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}