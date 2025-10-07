import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct, createProduct, updateProduct } from "../services/productService";
import { useAuth } from "../context/AuthContext";

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
    status: "Processing",
    reviewByBuyer: false,
    reviewBySeller: false,
    ponude: [],
  });

  useEffect(() => {
    if ((!user || user.uloga !== "Prodavac") && !alerted.current) {
      alerted.current = true;
      alert("Only the seller can add or edit products!");
      navigate("/products");
    }
  }, [user, navigate]);

  useEffect(() => {
    async function loadProduct() {
      try {
        const product = await getProduct(id);
        setFormData({
          ...formData,
          name: product.name,
          description: product.description || "",
          price: product.price,
          image: product.image || "",
          salesType: product.salesType || "fixedPrice",
          categoryId: product.categoryId || "",
          location: product.location || {
            street: "",
            number: "",
            city: "",
            postalCode: "",
            latitude: "",
            longitude: "",
          },
          status: product.status || "Processing",
          reviewByBuyer: product.reviewByBuyer || false,
          reviewBySeller: product.reviewBySeller || false,
          ponude: product.ponude || [],
        });
      } catch (err) {
        console.error("Error loading product", err);
      }
    }

    if (id) loadProduct();
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

  async function handleSubmit(e) {
    e.preventDefault();

    const coords = await fetchCoordinates(formData.location);
    const updatedForm = {
      ...formData,
      location: {
        ...formData.location,
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
      dateOfCreation: new Date().toISOString()
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
      alert("Something went wrong while storing the product.");
    }
  }

  return (
    <div className="form-container">
      <h2>{id ? "Edit Product" : "Add Product"}</h2>
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
            <option value="1">Electronics</option>
            <option value="2">Clothing</option>
            <option value="3">Furniture</option>
            <option value="4">Shoes</option>
          </select>
        </label>

        <fieldset>
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

        <button type="submit" className="btn">
          {id ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
}
