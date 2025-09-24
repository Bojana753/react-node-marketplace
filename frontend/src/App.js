import React from "react";
import { BrowserRouter as Router, Routes, Route , Navigate} from "react-router-dom";

import Home from "./pages/Home";
import RegisterPage from "./pages/RegisterPage";
import ProductTabs from "./pages/ProductTabs";
import ProductForm from "./pages/ProductForm";  // 👈 dodaj import
import Profile from "./pages/Profile";
import MyProducts from "./pages/MyProducts";
import ProductDetails from "./pages/ProductDetails";
import CartSeller from "./pages/CartsSeller";
import LoginPage from './pages/LoginPage'; 
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductTabs />} />
        <Route path="/profile" element={<Profile />} />
       <Route path="/my-products" element={<MyProducts />} />  
       <Route path="/products/:id" element={<ProductDetails />} />


        <Route path="/carts" element={<CartSeller />} />


        {/* 👇 dodaj forme za dodavanje i editovanje proizvoda */}
        <Route path="/add" element={<ProductForm />} />
        <Route path="/edit/:id" element={<ProductForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
