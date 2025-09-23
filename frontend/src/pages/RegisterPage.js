import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/auth.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    ime: '',
    prezime: '',
    korisnickoIme: '',
    email: '',
    telefon: '',
    lozinka: '',
    potvrdaLozinke: '',
    uloga: 'kupac',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.lozinka !== formData.potvrdaLozinke) {
      setError('Lozinke se ne poklapaju.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ime: formData.ime,
          prezime: formData.prezime,
          korisnickoIme: formData.korisnickoIme,
          email: formData.email,
          telefon: formData.telefon,
          lozinka: formData.lozinka,
          uloga: formData.uloga,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Došlo je do greške prilikom registracije.');
      }
    } catch (err) {
      setError('Neuspešno povezivanje sa serverom.');
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
        src="/RegisterPageBg.png"
        alt="Register Background"
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
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingRight: '10%',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '450px',
            maxHeight: '95vh',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '25px',
            borderRadius: '12px',
          }}
        >
          <h1 className="auth-title">Create Account</h1>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleRegister}>
            {/* Grid raspored */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
              }}
            >
              <div className="form-group">
                <label htmlFor="ime">Name</label>
                <input
                  type="text"
                  id="ime"
                  name="ime"
                  className="form-input"
                  value={formData.ime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prezime">Surname</label>
                <input
                  type="text"
                  id="prezime"
                  name="prezime"
                  className="form-input"
                  value={formData.prezime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="korisnickoIme">Username</label>
                <input
                  type="text"
                  id="korisnickoIme"
                  name="korisnickoIme"
                  className="form-input"
                  value={formData.korisnickoIme}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefon">Phone</label>
                <input
                  type="tel"
                  id="telefon"
                  name="telefon"
                  className="form-input"
                  value={formData.telefon}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="uloga">Role</label>
                <select
                  id="uloga"
                  name="uloga"
                  className="form-input"
                  value={formData.uloga}
                  onChange={handleChange}
                  required
                >
                  <option value="kupac">Costumer</option>
                  <option value="prodavac">Seller</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="lozinka">Password</label>
                <input
                  type="password"
                  id="lozinka"
                  name="lozinka"
                  className="form-input"
                  value={formData.lozinka}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="potvrdaLozinke">Confirm</label>
                <input
                  type="password"
                  id="potvrdaLozinke"
                  name="potvrdaLozinke"
                  className="form-input"
                  value={formData.potvrdaLozinke}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn"
              style={{ marginTop: '20px', width: '100%' }}
            >
              Register
            </button>
          </form>

          <p className="switch-auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
