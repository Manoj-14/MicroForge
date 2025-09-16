import axios from 'axios';
import { loadConfig } from '../config';

let loginApi, authApi, notificationApi, metadataApi;

export async function initApiService() {
  const cfg = await loadConfig();

  const {
    REACT_APP_LOGIN_SERVICE_URL: LOGIN_SERVICE_URL,
    REACT_APP_AUTH_SERVICE_URL: AUTH_SERVICE_URL,
    REACT_APP_NOTIFICATION_SERVICE_URL: NOTIFICATION_SERVICE_URL,
    REACT_APP_METADATA_SERVICE_URL: METADATA_SERVICE_URL,
  } = cfg;

  console.log('LOGIN_SERVICE_URL:', LOGIN_SERVICE_URL);
  console.log('AUTH_SERVICE_URL:', AUTH_SERVICE_URL);
  console.log('NOTIFICATION_SERVICE_URL:', NOTIFICATION_SERVICE_URL);
  console.log('METADATA_SERVICE_URL:', METADATA_SERVICE_URL);

  if (!LOGIN_SERVICE_URL || !AUTH_SERVICE_URL || !NOTIFICATION_SERVICE_URL || !METADATA_SERVICE_URL) {
    throw new Error('One or more service URLs missing in runtime config');
  }

  // Create axios instances
  loginApi = axios.create({ baseURL: LOGIN_SERVICE_URL, headers: { 'Content-Type': 'application/json' } });
  authApi = axios.create({ baseURL: AUTH_SERVICE_URL, headers: { 'Content-Type': 'application/json' } });
  notificationApi = axios.create({ baseURL: NOTIFICATION_SERVICE_URL, headers: { 'Content-Type': 'application/json' } });
  metadataApi = axios.create({ baseURL: METADATA_SERVICE_URL, headers: { 'Content-Type': 'application/json' } });

  const addAuthToken = config => {
    const token = localStorage.getItem('jwt_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  };
  [loginApi, authApi, notificationApi, metadataApi].forEach(api => api.interceptors.request.use(addAuthToken));
}

// Wrap each call to ensure initApiService() was awaited
function ensureReady(apiFn) {
  return async (...args) => {
    if (!loginApi) await initApiService();
    return apiFn(...args);
  };
}

export const apiService = {
  login: ensureReady((username, password) => loginApi.post('/api/auth/login', { username, password })),
  register: ensureReady(userData => loginApi.post('/api/auth/register', userData)),
  validateToken: ensureReady(token => authApi.post('/api/validate', { token })),
  getUsers: ensureReady(() => loginApi.get('/api/users')),
  createUser: ensureReady(userData => loginApi.post('/api/users', userData)),
  updateUser: ensureReady((id, data) => loginApi.put(`/api/users/${id}`, data)),
  deleteUser: ensureReady(id => loginApi.delete(`/api/users/${id}`)),
  getUserProfile: ensureReady(() => loginApi.get('/api/users/profile')),
  getNotifications: ensureReady(() => notificationApi.get('/api/notifications')),
  markNotificationRead: ensureReady(id => notificationApi.put(`/api/notifications/${id}/read`)),
  sendNotification: ensureReady(data => notificationApi.post('/api/notifications/send', data)),
  sendEmailNotification: ensureReady(data => notificationApi.post('/api/notifications/email', data)),
  getNotificationStatus: ensureReady(id => notificationApi.get(`/api/notifications/status/${id}`)),
  getInstanceMetadata: ensureReady(() => metadataApi.get('/api/metadata/instance')),
  getDeploymentInfo: ensureReady(() => metadataApi.get('/api/metadata/deployment')),
  getNetworkInfo: ensureReady(() => metadataApi.get('/api/metadata/network')),
  startStressTest: ensureReady((duration, stressType = 'cpu') => {
    return metadataApi.post('/api/stress/start', {
      duration: duration * 60, // Convert minutes to seconds
      type: stressType
    });
  }),
  getStressStatus: ensureReady(() => metadataApi.get('/api/stress/status')),
  stopStressTest: ensureReady(() => metadataApi.post('/api/stress/stop')),
  getServiceHealth: ensureReady(async () => {
    const services = [
      { name: 'Login', api: loginApi, url: '/actuator/health' },
      { name: 'Auth', api: authApi, url: '/api/health' },
      { name: 'Notification', api: notificationApi, url: '/actuator/health' },
      { name: 'Metadata', api: metadataApi, url: '/api/health' },
    ];
    return Promise.allSettled(
      services.map(svc => svc.api.get(svc.url).then(
        () => ({ name: svc.name, status: 'healthy', time: Date.now() }),
        err => ({ name: svc.name, status: 'unhealthy', error: err.message })
      ))
    );
  }),
};

export default apiService;
