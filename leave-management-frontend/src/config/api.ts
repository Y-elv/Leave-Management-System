/**
 * Backend base URL. In Vite, use VITE_BACKEND_URL in .env (not REACT_APP_*).
 * Fallback for local dev when env is unset.
 */
export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') ||
  'http://localhost:8081';


  

export const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache'
});




