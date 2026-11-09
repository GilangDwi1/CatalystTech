import jwtDecode from "jwt-decode";
import axios from "../api/axiosInstance";

export function getToken() {
  return localStorage.getItem("token");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export async function login(nip, password) {
  const resp = await axios.post("/auth/login", { nip, password });
  const token = resp.data.access_token || resp.data.token;
  const refresh = resp.data.refresh_token;
  if (token) localStorage.setItem("token", token);
  if (refresh) localStorage.setItem("refresh_token", refresh);
  return getUserFromToken();
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/";
}
