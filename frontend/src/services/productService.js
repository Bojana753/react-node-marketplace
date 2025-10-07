const API_URL = "http://localhost:5000/api/products";

function getToken() {
  return localStorage.getItem("token");
}

export async function getAllProducts() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function getProduct(id) {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
}

export async function createProduct(product, token = getToken()) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create product");
  return data;
}

export async function updateProduct(id, product, token = getToken()) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update product");
  return data;
}

export async function deleteProduct(id, token = getToken()) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete product");
  return data;
}

export async function updateProductStatus(productId, status, token = getToken()) {
  const res = await fetch(`${API_URL}/${productId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update product status");
  return data;
}

export async function cancelPurchase(productId, token = getToken()) {
  const res = await fetch(`${API_URL}/${productId}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to cancel purchase");
  return data;
}
export async function endAuction(productId, token = getToken()) {
 
  const res = await fetch(`${API_URL}/${productId}/end-auction`, {
    method: "POST", 
    headers: {
   
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
 
    throw new Error(data.message || "Failed to end the auction.");
  }
  return data;
}
export async function getMyPurchases(token = getToken()) {
  const res = await fetch(`${API_URL}/my-purchases`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch purchase history");
  return res.json();
}
export async function getProductsForApproval(token = getToken()) {
  const res = await fetch(`${API_URL}/for-approval`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch products for approval");
  return res.json();
}

export async function getAllCategories() {
  const res = await fetch(`http://localhost:5000/api/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function createCategory(categoryName, token = getToken()) {
  const res = await fetch(`http://localhost:5000/api/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ name: categoryName })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create category");
  return data;
}