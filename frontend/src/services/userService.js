/**
 * Dohvata profil trenutno ulogovanog korisnika sa servera.
 * @returns {Promise<object>} Objekat sa podacima o profilu.
 */
export async function getMyProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found. Please log in.');
  }

  const response = await fetch('http://localhost:5000/api/users/profile', {
    headers: {
      // Šaljemo token da bi nas middleware prepoznao
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile data.');
  }
  return await response.json();
}