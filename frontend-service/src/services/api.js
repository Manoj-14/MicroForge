import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const LOGIN_SERVICE_URL = process.env.REACT_APP_LOGIN_SERVICE_URL || 'http://localhost:8081';
const AUTH_SERVICE_URL = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:8082';
const NOTIFICATION_SERVICE_URL = process.env.REACT_APP_NOTIFICATION_SERVICE_URL || 'http://localhost:8083';
const METADATA_SERVICE_URL = process.env.REACT_APP_METADATA_SERVICE_URL || 'http://localhost:8084';

// Create axios instances for each service
const loginApi = axios.create({
  baseURL: LOGIN_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const notificationApi = axios.create({
  baseURL: NOTIFICATION_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const metadataApi = axios.create({
  baseURL: METADATA_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
const addAuthToken = (config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Add interceptors to all APIs
[loginApi, authApi, notificationApi, metadataApi].forEach(api => {
  api.interceptors.request.use(addAuthToken);
});

export const apiService = {
  // Authentication
  async login(username, password) {
    const response = await loginApi.post('/api/auth/login', { username, password });
    console.log('🔍 Login response:', response);
    return response;
  },

  async register(userData) {
    const response = await loginApi.post('/api/auth/register', userData);
    console.log('🔍 Registration response:', response);
    return response;
  },

  async validateToken(token) {
    const response = await authApi.post('/api/validate', { token });
    return response;
  },

  // User CRUD operations
  async getUsers() {
    const response = await loginApi.get('/api/users');
    return response;
  },

  async createUser(userData) {
    const response = await loginApi.post('/api/users', userData);
    return response;
  },

  async updateUser(userId, userData) {
    const response = await loginApi.put(`/api/users/${userId}`, userData);
    return response;
  },

  async deleteUser(userId) {
    const response = await loginApi.delete(`/api/users/${userId}`);
    return response;
  },

  async getUserProfile() {
    const response = await loginApi.get('/api/users/profile');
    return response;
  },

  // Notifications
  async getNotifications() {
    const response = await notificationApi.get('/api/notifications');
    return response;
  },

  async markNotificationRead(notificationId) {
    const response = await notificationApi.put(`/api/notifications/${notificationId}/read`);
    return response;
  },

  async sendNotification(notificationData) {
    const response = await notificationApi.post('/api/notifications/send', notificationData);
    return response;
  },

  // Metadata
  async getMetadata() {
    const response = await metadataApi.get('/api/metadata/instance');
    return response;
  },

  async getDeploymentInfo() {
    const response = await metadataApi.get('/api/metadata/deployment');
    return response;
  },

  // Health checks
  async getServiceHealth() {
    const services = [
      { name: 'Login Service', api: loginApi, url: '/actuator/health' },
      { name: 'Auth Service', api: authApi, url: '/api/health' },
      { name: 'Notification Service', api: notificationApi, url: '/actuator/health' },
      { name: 'Metadata Service', api: metadataApi, url: '/api/health' },
    ];

    const healthChecks = await Promise.allSettled(
      services.map(async (service) => {
        const startTime = Date.now();
        try {
          await service.api.get(service.url);
          return {
            name: service.name,
            status: 'healthy',
            responseTime: `${Date.now() - startTime}ms`,
            lastCheck: new Date().toISOString(),
          };
        } catch (error) {
          return {
            name: service.name,
            status: 'unhealthy',
            responseTime: `${Date.now() - startTime}ms`,
            lastCheck: new Date().toISOString(),
            error: error.message,
          };
        }
      })
    );

    return healthChecks.map(result => result.value || result.reason);
  },

  // Add these methods to your existing api.js file

// Notification Service APIs
async getNotifications() {
  return notificationApi.get('/api/notifications');
},

async markNotificationRead(notificationId) {
  return notificationApi.put(`/api/notifications/${notificationId}/read`);
},

async sendNotification(notificationData) {
  return notificationApi.post('/api/notifications/send', notificationData);
},

async sendEmailNotification(emailData) {
  return notificationApi.post('/api/notifications/email', emailData);
},

async getNotificationStatus(notificationId) {
  return notificationApi.get(`/api/notifications/status/${notificationId}`);
},

// Metadata Service APIs
async getInstanceMetadata() {
  return metadataApi.get('/api/metadata/instance');
},

async getDeploymentInfo() {
  return metadataApi.get('/api/metadata/deployment');
},

async getNetworkInfo() {
  return metadataApi.get('/api/metadata/network');
},

// Stress Testing APIs
async startStressTest(duration, stressType = 'cpu') {
  return metadataApi.post('/api/stress/start', {
    duration: duration * 60, // Convert minutes to seconds
    type: stressType
  });
},

async getStressStatus() {
  return metadataApi.get('/api/stress/status');
},

async stopStressTest() {
  return metadataApi.post('/api/stress/stop');
},


};



export default apiService;