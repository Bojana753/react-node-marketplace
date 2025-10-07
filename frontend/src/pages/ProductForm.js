import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct, createProduct, updateProduct, getAllCategories, createCategory } from "../services/productService";
import { useAuth } from "../context/AuthContext";
import "../css/Form.css";

export default function ProductForm() {
  const { user, token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const alerted = useRef(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    salesType: "fixedPrice",
    categoryId: "",
    location: {
      street: "",
      number: "",
      city: "",
      postalCode: "",
      latitude: "",
      longitude: "",
    },
    status: "Active",
    reviewByBuyer: false,
    reviewBySeller: false,
    ponude: [],
  });

  const [categories, setCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.backgroundImage = "url('/background.jpg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.minHeight = "100vh";
  }, []);

  useEffect(() => {
    if ((!user || user.uloga !== "Prodavac") && !alerted.current) {
      alerted.current = true;
      alert("Only the seller can add or edit products!");
      navigate("/products");
    }
  }, [user, navigate]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const cats = await getAllCategories();
        setCategories(cats);

        if (id) {
          const product = await getProduct(id);
          setFormData({
            ...formData,
            name: product.name,
            description: product.description || "",
            price: product.price,
            image: product.image || "",
            salesType: product.salesType || "fixedPrice",
            categoryId: product.categoryId || "",
            location: product.location || { street: "", number: "", city: "", postalCode: "" },
            status: product.status || "Active",
            reviewByBuyer: product.reviewByBuyer || false,
            reviewBySeller: product.reviewBySeller || false,
            ponude: product.ponude || [],
          });
        }
      } catch (err) {
        console.error("Error loading initial data", err);
        setError("Failed to load initial data for the form.");
      }
    }
    loadInitialData();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (["street", "number", "city", "postalCode"].includes(name)) {
      setFormData({
        ...formData,
        location: { ...formData.location, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  async function fetchCoordinates({ street, number, city, postalCode }) {
    const address = `${street} ${number}, ${city}, ${postalCode}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          latitude: data[0].lat,
          longitude: data[0].lon,
        };
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }
    return { latitude: "", longitude: "" };
  }

  const handleAddNewCategory = async () => {
    if (newCategoryName.trim() === "") {
      setError("Category name cannot be empty.");
      return;
    }
    try {
      const newCategory = await createCategory(newCategoryName, token);
      setCategories([...categories, newCategory]);
      setFormData({ ...formData, categoryId: newCategory.id });
      setShowNewCategoryInput(false);
      setNewCategoryName("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const coords = await fetchCoordinates(formData.location);
    const updatedForm = {
      ...formData,
      location: {
        ...formData.location,
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
      dateOfCreation: id ? formData.dateOfCreation : new Date().toISOString()
    };

    try {
      if (id) {
        await updateProduct(id, updatedForm, token);
      } else {
        await createProduct(updatedForm, token);
      }
      navigate("/products");
    } catch (err) {
      console.error("Error saving product", err);
      setError(err.message || "Something went wrong while storing the product.");
    }
  }

  return (
    <div 
      className="form-container"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.85)", // blago providna
        padding: "35px 40px",
        borderRadius: "12px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.07)",
      }}
    >
      <h2>{id ? "Edit Product" : "Add Product"}</h2>
      {error && <p style={{color: 'red', marginBottom: '15px'}}>{error}</p>}
      <form onSubmit={handleSubmit} className="product-form">
        <label>
          Name:
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>

        <label>
          Description:
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </label>

        <label>
          Price:
          <input type="number" name="price" value={formData.price} onChange={handleChange} required />
        </label>

        <label>
          Image URL:
          <input type="text" name="image" value={formData.image} onChange={handleChange} />
        </label>

        <label>
          Sales Type:
          <select name="salesType" value={formData.salesType} onChange={handleChange}>
            <option value="fixedPrice">Fixed Price</option>
            <option value="auction">Auction</option>
          </select>
        </label>

        <label>
          Category:
          <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
            <option value="">Select Category</option>
            {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </label>

        {!showNewCategoryInput ? (
            <button type="button" onClick={() => setShowNewCategoryInput(true)} className="btn-secondary" style={{ marginTop: '10px', width: 'fit-content' }}>
                + Add New Category
            </button>
        ) : (
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                    type="text"
                    placeholder="Enter new category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    style={{ flexGrow: 1 }}
                />
                <button type="button" onClick={handleAddNewCategory} className="btn-success">Save</button>
                <button type="button" onClick={() => setShowNewCategoryInput(false)} className="btn-danger">Cancel</button>
            </div>
        )}

        <fieldset style={{marginTop: '20px'}}>
          <legend>Location</legend>
          <label>
            Street:
            <input type="text" name="street" value={formData.location.street} onChange={handleChange} required />
          </label>
          <label>
            Number:
            <input type="text" name="number" value={formData.location.number} onChange={handleChange} required />
          </label>
          <label>
            City:
            <input type="text" name="city" value={formData.location.city} onChange={handleChange} required />
          </label>
          <label>
            Postal Code:
            <input type="text" name="postalCode" value={formData.location.postalCode} onChange={handleChange} required />
          </label>
        </fieldset>

        <button type="submit" className="btn" style={{ marginTop: '20px', width: '100%' }}>
          {id ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
}
