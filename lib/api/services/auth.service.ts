import apiClient from "../client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  role?: string;
}

export async function login(payload: LoginPayload) {
  const res = await apiClient.post<{ success?: boolean; message?: string; data?: LoginResponse }>("/auth/login", payload);
  return (res && (res as any).data) ? (res as any).data : res;
}

export async function resetPassword() {
  const res = await apiClient.post<{ success?: boolean; message?: string }>("/admin/reset-password");
  return (res && (res as any).message) ? res : (res && (res as any).data) ? (res as any).data : res;
}

export function clearAuth() {
  try {
    apiClient.setToken(null);
  } catch (e) {
    // ignore
  }
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } catch (e) {
    // ignore
  }
}

export default { login, resetPassword, clearAuth };
