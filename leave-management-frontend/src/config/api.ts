export const API_BASE_URL = 'http://localhost:8083';
// export const API_BASE_URL = 'https://leave-management-system-6cab.onrender.com';


export const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache'
});
