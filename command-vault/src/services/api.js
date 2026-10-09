const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TOKEN_KEY = 'cv_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY)
};

// Generic request helper with automatic token injection and error handling
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const token = tokenStorage.get();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // If session expired or unauthorized on protected routes
    if (response.status === 401 && token) {
      tokenStorage.remove();
      localStorage.removeItem('cv_currentUser');
      window.dispatchEvent(new CustomEvent('cv:unauthorized'));
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage = (data && data.error) ? data.error : (typeof data === 'string' && data) || `Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
    }
    throw error;
  }
}

// --- Auth API ---
export const authApi = {
  login: async (username, password) => {
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  me: async () => {
    return await apiRequest('/auth/me');
  }
};

// --- Folders API ---
export const foldersApi = {
  getAll: () => apiRequest('/folders'),
  getById: (id) => apiRequest(`/folders/${id}`),
  create: (data) => apiRequest('/folders', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/folders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/folders/${id}`, {
    method: 'DELETE'
  }),
  duplicate: (id) => apiRequest(`/folders/${id}/duplicate`, {
    method: 'POST'
  })
};

// --- Commands API ---
export const commandsApi = {
  getAll: () => apiRequest('/commands'),
  getByFolder: (folderId) => apiRequest(`/folders/${folderId}/commands`),
  saveForFolder: (folderId, commands) => apiRequest(`/folders/${folderId}/commands`, {
    method: 'POST',
    body: JSON.stringify({ commands })
  }),
  recordCopy: (id) => apiRequest(`/commands/${id}/copy`, {
    method: 'POST'
  })
};

// --- Devices API ---
export const devicesApi = {
  getAll: () => apiRequest('/devices'),
  getById: (id) => apiRequest(`/devices/${id}`),
  create: (data) => apiRequest('/devices', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/devices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/devices/${id}`, {
    method: 'DELETE'
  })
};

// --- Users API ---
export const usersApi = {
  getAll: () => apiRequest('/users'),
  create: (data) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/users/${id}`, {
    method: 'DELETE'
  })
};

// --- Notifications API ---
export const notificationsApi = {
  getAll: () => apiRequest('/notifications'),
  markAsRead: () => apiRequest('/notifications/read', {
    method: 'PUT'
  })
};

// --- Areas API ---
export const areasApi = {
  getAll: () => apiRequest('/areas'),
  create: (name) => apiRequest('/areas', {
    method: 'POST',
    body: JSON.stringify({ name })
  })
};

export default {
  auth: authApi,
  folders: foldersApi,
  commands: commandsApi,
  devices: devicesApi,
  users: usersApi,
  notifications: notificationsApi,
  areas: areasApi,
  API_URL
};
