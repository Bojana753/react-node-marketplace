import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllProducts, deleteProduct, updateProductStatus } from "../services/productService";
import { getCartItems, createCartItem } from "../services/cartItemService";
import { useAuth } from "../context/AuthContext";
import "../css/product.css";


export default function ProductTabs() {
  const [tab, setTab] = useState("all");
  const [allProducts, setAllProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);

  const [searchTerm, setSearchTerm] = useState(""); 
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [salesType, setSalesType] = useState(""); 
  const [categoryFilter, setCategoryFilter] = useState(""); 
  const [locationFilter, setLocationFilter] = useState(""); 

  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const isSeller = user && user.uloga === "Prodavac";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      const cartItems = user ? await getCartItems() : []; 
      const cartItemIds = new Set(cartItems.map(item => item.productId));
      setAllProducts(data.filter(product => !cartItemIds.has(product.id)));

      if (isSeller) {
        const res = await fetch("http://localhost:5000/api/products/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch my products");
        const myData = await res.json();
        setMyProducts(myData.filter(p => String(p.prodavacId) === String(user.id)));
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [isSeller, token, user?.id]);

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
      fetchProducts(); 
    } catch (err) {
      console.error("Purchase error:", err);
      alert(`Error: ${err.message}`);
    }
  };

  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
      fetchProducts();
    }
  }

  const renderProducts = (products, showAddBtn = true, isMine = false) => {
    if (loading) return <div className="loading">Loading products...</div>;

    const filteredProducts = products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesPrice =
        (!priceFrom || parseFloat(p.price) >= parseFloat(priceFrom)) &&
        (!priceTo || parseFloat(p.price) <= parseFloat(priceTo));

      const matchesSalesType = !salesType || p.salesType === salesType;
      const matchesCategory = !categoryFilter || String(p.categoryId) === String(categoryFilter);
      const matchesLocation =
        !locationFilter || (
          p.location &&
          (
            (p.location.street && p.location.street.toLowerCase().includes(locationFilter.toLowerCase())) ||
            (p.location.city && p.location.city.toLowerCase().includes(locationFilter.toLowerCase()))
          )
        );

      return matchesSearch && matchesPrice && matchesSalesType && matchesCategory && matchesLocation;
    });

    if (filteredProducts.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          {isMine ? (
            <>
              <h3>Nema proizvoda koje ste vi kreirali</h3>
              <p>Dodajte svoj prvi proizvod.</p>
              {isSeller && <Link to="/add" className="add-btn">➕ Add Product</Link>}
            </>
          ) : (
            <>
              <h3>No products found</h3>
              {showAddBtn && isSeller && (
                <>
                  <p>Start by adding your first product to the collection.</p>
                  <Link to="/add" className="add-btn">➕ Add Product</Link>
                </>
              )}
            </>
          )}
        </div>
      );
    }

    return (
      <ul className="product-grid">
        {filteredProducts.map((p) => {
          const highestBid = p.ponude?.sort((a, b) => b.cena - a.cena)[0];
          const displayPrice = highestBid ? highestBid.cena : p.price;
          const priceLabel =
            p.salesType === "auction"
              ? highestBid ? "Current Bid:" : "Starting at:"
              : "Price:";

          const isOwner = isSeller && String(user?.id) === String(p.prodavacId);

          return (
            <li key={p.id} className="product-card">
              <Link to={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
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
                <p className="product-price">{priceLabel} ${displayPrice}</p>
              </Link>
              
              {user && user.uloga === "Kupac" && p.salesType === "fixedPrice" && !isOwner && !isMine && (
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
                <div className="card-actions">
                  <button className="delete-btn small" onClick={() => handleDelete(p.id)}>Delete</button>
                  <Link className="btn small" to={`/edit/${p.id}`}>Edit</Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div
      className="products-page"
      style={{
        backgroundImage: "url('/background-products.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundColor: "rgba(0,0,0,0.3)",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="container">
        <div className="header-section">
          <h1 className="page-title">Products</h1>
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "10px 15px",
              margin: "10px 0",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "1rem"
            }}
          />
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
            <input
              type="number"
              placeholder="Price from"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
            />
            <input
              type="number"
              placeholder="Price to"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
            />
            <select value={salesType} onChange={(e) => setSalesType(e.target.value)}>
              <option value="">All types</option>
              <option value="auction">Auction</option>
              <option value="fixedPrice">Fixed Price</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All categories</option>
              <option value="1">Electronics</option>
              <option value="2">Clothing</option>
              <option value="3">Furniture</option>
              <option value="4">Shoes</option>
            </select>
            <input
              type="text"
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>

          {isSeller && (
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={() => setTab("my")}
                style={{
                  padding: "10px 20px",
                  fontWeight: tab === "my" ? "bold" : "normal",
                }}
              >
                My Products
              </button>
            </div>
          )}

          {tab === "all" && isSeller && (
            <div className="actions">
              <Link to="/add" className="add-btn">➕ Add Product</Link>
            </div>
          )}
        </div>

        {tab === "all"
          ? renderProducts(allProducts, true, false)
          : renderProducts(myProducts, false, true)}
      </div>
    </div>
  );
}