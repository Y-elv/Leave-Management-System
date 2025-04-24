export const API_BASE_URL = 'http://localhost:8083';

export const API_ENDPOINTS = {
  ME: `${API_BASE_URL}/api/users/me`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  MICROSOFT_LOGIN: `${API_BASE_URL}/oauth2/authorization/azure-dev`
};

export const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache'
});
