// frontend/services/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
  const token = sessionStorage.getItem('mm_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
};

export const api = {
  // Auth
  register: async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return handleResponse(response);
  },

  login: async (identifier: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    return handleResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  // Products
  getActiveProducts: async () => {
    const response = await fetch(`${API_URL}/products/active`);
    return handleResponse(response);
  },

  getAllProducts: async () => {
    const response = await fetch(`${API_URL}/products/all`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  createProduct: async (formData: FormData) => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData
    });
    return handleResponse(response);
  },

  updateProduct: async (id: string, formData: FormData) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: formData
    });
    return handleResponse(response);
  },

  deleteProduct: async (id: string) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  // Orders
  createOrder: async (items: any[]) => {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items })
    });
    return handleResponse(response);
  },

  getUserOrders: async () => {
    const response = await fetch(`${API_URL}/orders/my-orders`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  getAllOrders: async () => {
    const response = await fetch(`${API_URL}/orders/all`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  // Cards
  addCard: async (cardData: any) => {
    const response = await fetch(`${API_URL}/cards`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cardData)
    });
    return handleResponse(response);
  },

  getUserCards: async () => {
    const response = await fetch(`${API_URL}/cards`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  setDefaultCard: async (id: string) => {
    const response = await fetch(`${API_URL}/cards/${id}/default`, {
      method: 'PATCH',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  deleteCard: async (id: string) => {
    const response = await fetch(`${API_URL}/cards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  // Admin
  getStatistics: async () => {
    const response = await fetch(`${API_URL}/admin/statistics`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  getAllUsers: async () => {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  grantAdminRole: async (email: string) => {
    const response = await fetch(`${API_URL}/admin/grant-admin`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  revokeAdminRole: async (userId: string) => {
    const response = await fetch(`${API_URL}/admin/revoke-admin/${userId}`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  getAllTransactions: async () => {
    const response = await fetch(`${API_URL}/admin/transactions`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  }
};
