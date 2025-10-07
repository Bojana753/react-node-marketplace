import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductTabs from "./pages/ProductTabs";
import ProductForm from "./pages/ProductForm";
import MyProducts from "./pages/MyProducts";
import ProductDetails from "./pages/ProductDetails";
import CartSeller from "./pages/CartsSeller";
import Navbar from "./pages/Navbar"; 
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import MyPurchases from './pages/MyPurchases';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './AdminRoute'; 
import MySales from './pages/MySales';


function App() {
  return (
    <Router>
      <Navbar /> 
        <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductTabs />} />
        <Route path="/my-products" element={<MyProducts />} />  
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/carts" element={<CartSeller />} />
        <Route path="/add" element={<ProductForm />} />
        <Route path="/edit/:id" element={<ProductForm />} />
         <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<PublicProfilePage />} />
          <Route path="/my-purchases" element={<MyPurchases />} />
          <Route path="/my-sales" element={<MySales />} />

       <Route 
            path="/admin" 
            element={
                <AdminRoute>
                    <AdminDashboard />
                </AdminRoute>
            } 
        />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

    </Router>
  );
}

export default App;
