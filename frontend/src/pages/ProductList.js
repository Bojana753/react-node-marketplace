import React, { useEffect, useState } from "react";
import { getAllProducts, updateProductStatus } from "../services/productService";
import { createCartItem } from "../services/cartItemService"; 
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import "../css/product.css";

export default function ProductList() {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filters, setFilters] = useState({
    priceFrom: "",
    priceTo: "",
    salesType: "",
    categoryId: "",
    location: "",
  });

  const isSeller = user && user.uloga === "Prodavac";

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }
 const handleShopNow = async (productId) => {
   if (!user) {
      alert("You must be logged in to buy!");
      return;
    }
    if (user.uloga !== 'Kupac') {
        alert("Only buyers can purchase products.");
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
      loadProducts(); 
    } catch (err) {
      console.error("Purchase error:", err);
      alert(`Error: ${err.message}`);
    }
  };


  function handleAddClick() {
    if (!isSeller) {
      alert("Only the seller can add products!");
      return;
    }
    navigate("/add");
  }

  async function handleDelete(productId) {
    if (window.confirm("Are you sure you want to delete the product?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to delete product");
        }
        alert("Product deleted successfully!");
        loadProducts();
      } catch (err) {
        console.error(err);
        alert("Error deleting product: " + err.message);
      }
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriceFrom = !filters.priceFrom || parseFloat(p.price) >= parseFloat(filters.priceFrom);
    const matchesPriceTo = !filters.priceTo || parseFloat(p.price) <= parseFloat(filters.priceTo);
    const matchesSalesType = !filters.salesType || p.salesType === filters.salesType;
    const matchesCategory = !filters.categoryId || String(p.categoryId) === String(filters.categoryId);
    const matchesLocation =
      !filters.location || (
        p.location &&
        (
          (p.location.street && p.location.street.toLowerCase().includes(filters.location.toLowerCase())) ||
          (p.location.city && p.location.city.toLowerCase().includes(filters.location.toLowerCase()))
        )
      );
    return matchesSearch && matchesPriceFrom && matchesPriceTo && matchesSalesType && matchesCategory && matchesLocation;
  });

  return (
    <div
      className="products-page"
      style={{
        backgroundImage: "url('/background-products.jpg')",
      }}
    >
      <div className="container">
        <div className="header-section">
          <h1 className="page-title">Our Products</h1>
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
          </div>
        ) : (
          <ul className="product-grid">
            {filteredProducts.map((p) => {
              const highestBid = p.ponude?.sort((a, b) => b.cena - a.cena)[0];
              const displayPrice = highestBid ? highestBid.cena : p.price;
              const priceLabel =
                p.salesType === "auction"
                  ? highestBid
                    ? "Current Bid:"
                    : "Starting at:"
                  : "Price:";

              const isOwner = isSeller && String(user?.id) === String(p.prodavacId);

              return (
                <li key={p.id} className="product-card">
                  <Link
                    to={`/products/${p.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {p.image ? (
                      <img
                        src={p.image.startsWith("http") ? p.image : `/${p.image}`}
                        alt={p.name}
                        className="product-image"
                      />
                    ) : (
                      <div className="product-image-placeholder">🛍</div>
                    )}
                    <h3>{p.name}</h3>
                    <p className="product-price">
                      {priceLabel} ${displayPrice}
                    </p>
                  </Link>

                  {user && user.uloga === "Kupac" && p.salesType === "fixedPrice" && (
                     <div className="card-actions-bottom">
                        <button 
                            className="btn shop-btn-small" 
                            onClick={() => handleShopNow(p.id)}
                        >
                            Shop Now
                        </button>
                    </div>
                  )}


                  {isOwner && (
                    <div className="product-actions">
                      <button
                        className="btn edit-btn"
                        onClick={() => navigate(`/edit-product/${p.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn delete-btn"
                        style={{ marginLeft: "10px", backgroundColor: "crimson", color: "white" }}
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}