import React, { useEffect, useState } from "react";
import { getCartItems } from "../services/cartItemService";
import { getProductsForApproval } from "../services/productService";
import "../css/cartSeller.css";
import { useAuth } from "../context/AuthContext";

const CartSeller = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

 useEffect(() => {
   const loadItems = async () => {
    if (!user || user.uloga !== "Prodavac") return;

    try {
 
      const myProcessingProducts = await getProductsForApproval();

      const allCartItems = await getCartItems();

      const mergedItems = allCartItems
        .filter(item => myProcessingProducts.some(p => p.id === item.productId))
        .map(item => {
          const product = myProcessingProducts.find(p => p.id === item.productId);
          return {
            ...item,
            productName: product ? product.name : "Unknown Product"
          };
        });

      setCartItems(mergedItems);
    } catch (err) {
      console.error("Failed to load cart items for seller:", err);
    }
  };

  loadItems();
}, [user]);


 
 const approve = async (item) => {
  try {
    const res = await fetch(`http://localhost:5000/api/cart-items/${item.id}/approve`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to approve item");

    // ukloni iz stanja
    setCartItems(prev => prev.filter(i => i.id !== item.id));
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};



  const openRejectModal = (id) => {
    setSelectedItemId(id);
    setRejectionReason("");
    setShowModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Enter the reason for rejecting the purchase.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/cart-items/${selectedItemId}/reject`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to reject item");
      }

      setCartItems(prev => prev.filter(item => item.id !== selectedItemId));
      setShowModal(false);
    } catch (err) {
      console.error("Failed to reject item:", err);
      alert(err.message);
    }
  }



  return (
    <div className="table-container">
      <h2>Cart Items</h2>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map(item => (
            <tr key={item.id}>
              <td>{item.productName}</td>
              <td>{item.status}</td>
              <td>
                <button onClick={() => approve(item)}>Approve</button>
                <button onClick={() => openRejectModal(item.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {cartItems.length === 0 && <p className="empty">No items in cart.</p>}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Enter the reason for the rejection</h3>
            <textarea 
              value={rejectionReason} 
              onChange={(e) => setRejectionReason(e.target.value)} 
              placeholder="Reason..."
            />
            <div className="modal-buttons">
              <button onClick={handleReject}>Potvrdi</button>
              <button onClick={() => setShowModal(false)}>Otkaži</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSeller;
