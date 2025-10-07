import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../css/ProfilePage.css'; 

async function fetchProfile(token) {
    const res = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
}

async function updateBasicInfo(data, token) {
    const res = await fetch('/api/users/profile/basic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update basic info');
    }
    return res.json();
}

async function updateSensitiveInfo(data, token) {
    const res = await fetch('/api/users/profile/sensitive', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update sensitive info');
    }
    return res.json();
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [basicInfo, setBasicInfo] = useState({
        ime: '', prezime: '', telefon: '', datumRodjenja: '', opis: '', profilnaSlika: ''
    });
    const [sensitiveInfo, setSensitiveInfo] = useState({
        currentPassword: '', newUsername: '', newEmail: '', newPassword: ''
    });

    const loadProfile = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            setError("You are not logged in.");
            return;
        }
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            const data = await fetchProfile(token);
            setProfile(data);
            setBasicInfo({
                ime: data.ime || '',
                prezime: data.prezime || '',
                telefon: data.telefon || '',
                datumRodjenja: data.datumRodjenja ? data.datumRodjenja.split('T')[0] : '',
                opis: data.opis || '',
                profilnaSlika: data.profilnaSlika || ''
            });
            setSensitiveInfo({ currentPassword: '', newUsername: '', newEmail: '', newPassword: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleBasicChange = (e) => setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
    const handleSensitiveChange = (e) => setSensitiveInfo({ ...sensitiveInfo, [e.target.name]: e.target.value });

    const handleBasicSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        const token = localStorage.getItem('token');
        try {
            await updateBasicInfo(basicInfo, token);
            setSuccess('Basic information successfully updated!');
            loadProfile();
        } catch (err) {
            setError(err.message);
        }
    };
    
    const handleSensitiveSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        const token = localStorage.getItem('token');
        try {
            await updateSensitiveInfo(sensitiveInfo, token);
            setSuccess('Sensitive data successfully updated! Please log in again if you have changed your username or password.');
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="profile-page"><div className="profile-card"><h2>Loading Profile...</h2></div></div>;
    if (!profile) return <div className="profile-page"><div className="profile-card"><h2>{error || "Profile not found."}</h2></div></div>;

    return (
        <div className="profile-page">
            <div className="container">

                <div className="text-center mb-4">
                    {user && (
                        <Link to={`/profile/${user.id}`} className="btn btn-outline-secondary">
                            View My Public Profile
                        </Link>
                    )}
                </div>

                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {success && <div className="alert alert-success" role="alert">{success}</div>}

                <div className="row">
                    <div className="col-lg-6 mb-4">
                        <div className="profile-card h-100">
                            <h2>Basic Information</h2>
                            <form onSubmit={handleBasicSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">First Name</label>
                                    <input type="text" name="name" value={basicInfo.ime} onChange={handleBasicChange} className="form-control" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Last Name</label>
                                    <input type="text" name="surname" value={basicInfo.prezime} onChange={handleBasicChange} className="form-control" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Phone</label>
                                    <input type="text" name="telephone" value={basicInfo.telefon} onChange={handleBasicChange} className="form-control" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Date of Birth</label>
                                    <input type="date" name="dateOfBirth" value={basicInfo.datumRodjenja} onChange={handleBasicChange} className="form-control" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea name="description" value={basicInfo.opis} onChange={handleBasicChange} className="form-control" rows="3"></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Profile Picture URL</label>
                                    <input type="text" name="profilepicture" value={basicInfo.profilnaSlika} onChange={handleBasicChange} className="form-control" />
                                </div>
                                <button type="submit" className="btn btn-primary">Save Basic Info</button>
                            </form>
                        </div>
                    </div>

                    <div className="col-lg-6 mb-4">
                        <div className="profile-card h-100">
                            <h2>Sensitive Data</h2>
                            <p className="text-muted small">To change your username, email or password, your current password is required.</p>
                            <form onSubmit={handleSensitiveSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Current Password *</label>
                                    <input type="password" name="currentPassword" value={sensitiveInfo.currentPassword} onChange={handleSensitiveChange} className="form-control" required />
                                </div>
                                <hr/>
                                <div className="mb-3">
                                    <label className="form-label">New Username</label>
                                    <input type="text" name="newUsername" placeholder={profile.korisnickoIme} value={sensitiveInfo.newUsername} onChange={handleSensitiveChange} className="form-control" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">New Email</label>
                                    <input type="email" name="newEmail" placeholder={profile.email} value={sensitiveInfo.newEmail} onChange={handleSensitiveChange} className="form-control" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">New Password</label>
                                    <input type="password" name="newPassword" value={sensitiveInfo.newPassword} onChange={handleSensitiveChange} className="form-control" />
                                </div>
                                <button type="submit" className="btn btn-warning">Save Sensitive Data</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}