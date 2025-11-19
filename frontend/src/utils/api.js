import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('restaurant-pos-storage');
  if (token) {
    const parsed = JSON.parse(token);
    if (parsed.state?.token) {
      config.headers.Authorization = `Bearer ${parsed.state.token}`;
    }
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const restaurantAPI = {
  getMe: () => api.get('/restaurants/me'),
  completeSetup: (id, data) => api.put(`/restaurants/${id}/setup`, data),
  updateTableStatus: (id, tableLabel, status) => 
    api.put(`/restaurants/${id}/tables/${tableLabel}`, { status }),
  addExpense: (id, data) => api.post(`/restaurants/${id}/expenses`, data),
  updateProfile: (id, data) => api.put(`/restaurants/${id}/profile`, data),
  verifyEmail: (id, token) => api.post(`/restaurants/${id}/verify-email`, { token }),
  updateNotificationSettings: (id, settings) => api.put(`/restaurants/${id}/notifications`, { notificationSettings: settings }),
};

export const orderAPI = {
  create: (restaurantId, data) => api.post(`/orders/${restaurantId}`, data),
  update: (orderId, data) => api.put(`/orders/${orderId}`, data),
  delete: (orderId) => api.delete(`/orders/${orderId}`),
  getActive: (restaurantId) => api.get(`/orders/restaurant/${restaurantId}`),
  getTakeaway: (restaurantId) => api.get(`/orders/restaurant/${restaurantId}/takeaway`),
  updateStatus: (orderId, status) => api.put(`/orders/${orderId}/status`, { status }),
  complete: (orderId) => api.put(`/orders/${orderId}/complete`),
  generateSummary: (restaurantId, date) => api.post(`/orders/${restaurantId}/generate-summary`, { date }),
  getHistory: (restaurantId, period = 'daily', limit = 30) => 
    api.get(`/orders/${restaurantId}/history?period=${period}&limit=${limit}`),
};

export const analyticsAPI = {
  getAnalytics: (restaurantId, timeRange = 'today') => 
    api.get(`/analytics/${restaurantId}?timeRange=${timeRange}`),
};

export const summaryAPI = {
  generateSummary: (restaurantId, date) => api.post(`/orders/${restaurantId}/generate-summary`, { date }),
  getHistory: (restaurantId, period = 'daily', limit = 30) => 
    api.get(`/orders/${restaurantId}/history?period=${period}&limit=${limit}`),
};

export const exportData = {
  salesReport: async (restaurantId, params) => {
    const response = await api.post(`/exports/${restaurantId}/sales`, params, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || 'export.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  menuData: async (restaurantId, format) => {
    const response = await api.get(`/exports/${restaurantId}/menu/${format}`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || `menu.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default api;