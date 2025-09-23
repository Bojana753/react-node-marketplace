import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/auth.css'; 
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [korisnickoIme, setKorisnickoIme] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ korisnickoIme, lozinka }),
      });

      const data = await response.json();

      if (response.ok) {
        //localStorage.setItem('token', data.token);
        login(data.token);
        navigate('/');
      } else {
        setError(data.message || 'Error');
      }
    } catch (err) {
      setError('Unable to connect to server.');
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Pozadinska slika */}
      <img
        src="/LoginPageBg.png"
        alt="Login Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Desna polovina ekrana */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-end', // bliže desnom rubu
          alignItems: 'center',       // vertikalno centrirano
          paddingRight: '25%',        // malo pomerena ulevo od desnog ruba
          zIndex: 1,
        }}
      >
        {/* Forma za login */}
        <div
          style={{
            width: '400px',        // fiksna širina forme
            maxHeight: '95vh',     // da stane u ekran
            overflowY: 'auto',     // unutrašnji scroll ako je potrebno
          }}
        >
          <h1 className="auth-title">Welcome Back</h1>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                className="form-input"
                value={korisnickoIme}
                onChange={(e) => setKorisnickoIme(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={lozinka}
                onChange={(e) => setLozinka(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-btn">
              Sign in
            </button>
          </form>
          <p className="switch-auth-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
