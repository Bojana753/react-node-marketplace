import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Home,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext"; 
import "../css/Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  console.log("USER IN NAVBAR:", user);
  
  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <div className="navbar">
      <button className="icon-btn" onClick={() => navigate("/")}>
        <Home />
      </button>
      <button className="icon-btn" onClick={() => setMenuOpen(!menuOpen)}>
        <User />
      </button>

      {menuOpen && (
        <div className="menu-dropdown">
          {user ? (
            <>
              <div className="menu-user-info">
                Signed in as: <strong>{user.korisnickoIme}</strong>
              </div>

              {user.uloga === "Prodavac" && (
                <>
                  <Link
                    to="/carts"
                    className="menu-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    Cart Seller
                  </Link>
                  
                  <Link
                    to="/my-sales"
                    className="menu-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Sales
                  </Link>
                </>
              )}

              {user.uloga === "Kupac" && (
                <Link
                  to="/my-purchases"
                  className="menu-link"
                  onClick={() => setMenuOpen(false)}
                >
                  My Purchases
                </Link>
              )}

              <Link
                to="/profile"
                className="menu-link"
                onClick={() => setMenuOpen(false)}
              >
                My Profile
              </Link>
              
              {user.uloga === "Administrator" && (
                <Link
                  to="/admin"
                  className="menu-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}

              <button onClick={handleLogout} className="menu-link-button">
                <LogOut /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="menu-link"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="menu-link"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}