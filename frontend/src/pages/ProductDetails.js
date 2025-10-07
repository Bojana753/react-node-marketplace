import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getProduct, updateProductStatus, cancelPurchase, endAuction } from "../services/productService";
import { useAuth } from "../context/AuthContext";
import "../css/product.css";
import { createCartItem } from "../services/cartItemService";

const categoriesMap = {
  "1": "Electronics",
  "2": "Clothing",
  "3": "Furniture",
  "4": "Shoes"
};

async function getSellerProfile(sellerId) {
    const res = await fetch(`/api/users/${sellerId}`); 
    if (!res.ok) return null; 
    return res.json();
}

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);

  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProduct = useCallback(async () => {
    try {
       setLoading(true);
      setError("");
   
      const productData = await getProduct(id);
      setProduct(productData);

      if (productData && productData.prodavacId) {
          const sellerData = await getSellerProfile(productData.prodavacId);
          setSeller(sellerData); 
      }
    } catch (error) {
      console.error("Error loading product details:", error);
      setError("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
      loadProduct();
  }, [loadProduct]);

  const handleShopNow = async (productId) => {
    if (!user) {
      alert("You must be logged in to buy!");
      return;
    }

    try {
      await updateProductStatus(productId, "Processing");

      await createCartItem({
    cartId: user.cartId, 
    productId: productId,
    quantity: 1,
    status: "IN_PROGRESS"
});

      alert("Product is now being processed and added to your cart!");
      loadProduct();
    } catch (err) {
      console.error("Purchase error:", err);
      setError("Failed to process product.");
    }
  };

  const handleCancelPurchase = async (productId) => {
    if (!user) {
      alert("You must be logged in to cancel!");
      return;
    }

    try {
      await cancelPurchase(productId);
      alert("Purchase has been canceled!");
      loadProduct();
    } catch (err) {
      console.error("Cancellation error:", err);
      setError("Failed to cancel purchase.");
    }
  };
  const handleEndAuction = async (productId) => {
 
    if (!window.confirm("Are you sure you want to end the auction? The winner will be the user with the highest bid.")) {
      return;
    }
    try {
      await endAuction(productId);
      alert("The auction was successfully completed!");
      loadProduct(); 
    } catch (err) {
      console.error("Error ending auction:", err);
      setError(err.message || "Failed to end the auction."); 
    }
  };

  if (loading) return <div className="loading">Loading product details...</div>;
  if (!product) return <div className="error-state">Product not found.</div>;

  return (
    <div className="product-details">
      <div className="product-details-image">
        {product.image && (
          <img
            src={product.image.startsWith("http") ? product.image : `/${product.image}`}
            alt={product.name}
          />
        )}
      </div>

      <div className="product-details-info">
        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", color: "#222" }}>
          {product.name}
        </h2>

 {seller ? (
      <p className="seller-info" style={{ fontStyle: 'italic', color: '#555', marginBottom: '1rem' }}>
          Prodavac: <Link to={`/profile/${seller.id}`}>{seller.korisnickoIme}</Link>
      </p>
  ) : (
      <p className="seller-info" style={{ fontStyle: 'italic', color: '#555', marginBottom: '1rem' }}>
          Prodavac se učitava...
      </p>
  )}
        <p className="category">
          Category: {product.category?.name || categoriesMap[product.categoryId] || "N/A"}
        </p>

        <p className="price">Price: ${product.price}</p>

        {product.salesType === "fixedPrice" && product.status === "Active" && user?.uloga === "Kupac" && (
          <button className="btn shop-btn" onClick={() => handleShopNow(product.id)}>
            SHOP NOW
          </button>
        )}

        {product.salesType === "fixedPrice" && product.status === "Processing" && user?.uloga === "Kupac" && (
          <button className="btn cancel-btn" onClick={() => handleCancelPurchase(product.id)}>
            Cancel Purchase
          </button>
        )}

        {product.salesType === "fixedPrice" && product.status === "Active" && user?.uloga !== "Kupac" && (
          <p style={{ color: "red" }}>Only buyers can purchase this product.</p>
        )}

        <p className="description">{product.description}</p>
        {error && <p className="error-message small">{error}</p>}

        {product.status !== "Active" && (
          <div className="sold-badge">
            This item is no longer available ({product.status})
          </div>
        )}
      </div>

      {product && product.salesType === "auction" && (
        <div className="auction-section" style={{ marginTop: "30px" }}>
          <h3>Auction</h3>

          {product.ponude && product.ponude.length > 0 ? (
            <p>
              Current highest bid: ${Math.max(...product.ponude.map((p) => p.cena))}
            </p>
          ) : (
            <p>No bids yet. Starting price: ${product.price}</p>
          )}

          {user?.uloga === "Kupac"  && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const bidPrice = parseFloat(e.target.bid.value);
                if (!bidPrice || bidPrice <= 0) return alert("Enter a valid bid");

                const token = localStorage.getItem("token"); 

                try {
                  const res = await fetch(
                    `http://localhost:5000/api/products/${product.id}/bid`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ price: bidPrice }),
                    }
                  );

                  if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.message || "Failed to place bid");
                  }

                  alert("Bid placed successfully!");
                  loadProduct(); 
                  e.target.reset();
                } catch (err) {
                  console.error(err);
                  alert("Error placing bid: " + err.message);
                }
              }}
            >
              <input
                type="number"
                name="bid"
                placeholder="Your bid"
                step="0.01"
                min="0"
                required
                style={{ padding: "8px", marginRight: "10px", width: "120px" }}
              />
              <button type="submit" className="btn shop-btn">
                Place Bid
              </button>
            </form>
          )}

          {user?.uloga !== "Kupac" && product.status === "Active" && (
            <p style={{ color: "red" }}>
              Only buyers can place bids.
            </p>
          )}

          {product.status !== "Active" && (
            <div className="sold-badge">
              Auction ended ({product.status})
            </div>
          )}

          {(() => {
  
        const isOwner = user && user.id === product.prodavacId;
        const hasBids = product.ponude && product.ponude.length > 0;
        const isAuctionActive = product.status === 'Active';

        if (isOwner && isAuctionActive && hasBids) {
            return (
                <button 
                    className="btn cancel-btn" 
                    style={{ marginTop: '20px', width: '100%' }} 
                    onClick={() => handleEndAuction(product.id)}
                >
                    End auction
                </button>
            );
        }
        return null; 
    })()}
        </div>
      )}
    </div>
  );
}
