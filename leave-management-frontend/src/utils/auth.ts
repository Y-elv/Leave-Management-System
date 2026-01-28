import { API_BASE_URL } from "../config/api";
import type { User, UserRole } from "../types/user";

// Single source of truth for backend base URL in auth-related code
export const API_BASE = API_BASE_URL;

const AUTH_KEY = "slm_auth"; // localStorage key for auth payload

export interface AuthPayload {
  token: string;
  user: User;
  savedAt: string;
}

// Save token + user to localStorage
export function saveAuth(token: string, user: User) {
  const payload: AuthPayload = {
    token,
    user,
    savedAt: new Date().toISOString(),
  };

  // Store structured auth payload
  localStorage.setItem(AUTH_KEY, JSON.stringify(payload));

  // Maintain existing behaviour for other code paths that read just "token"
  localStorage.setItem("token", token);
}

// Read token + user from localStorage
export function getAuth(): AuthPayload | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthPayload;
  } catch {
    return null;
  }
}

// Clear all auth-related storage
export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem("token");
}

// Map roles to dashboard routes; adjust role strings if backend changes
export function getDashboardRouteForRole(role?: UserRole | string | null) {
  if (!role) return "/login";
  const r = role.toString().toUpperCase();
  if (r === "ADMIN") return "/dashboard/admin";
  if (r === "MANAGER") return "/dashboard/manager";
  // Fallback for STAFF or unknown roles
  return "/dashboard/staff";
}

// Convenience helper: save auth and redirect to appropriate dashboard
export function saveAuthAndRedirect(token: string, user: User) {
  saveAuth(token, user);
  const route = getDashboardRouteForRole(user.role);
  // Full page reload so App's initialization logic runs and picks up the token
  window.location.href = route;
}
