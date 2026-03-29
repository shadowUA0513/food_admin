import axios from "axios";
import { AUTH_COOKIE_KEY, API_TIMEOUT_MS } from "./constant";
import { env } from "./env";

function getCookie(name: string) {
  const escapedName = name.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));

  return match ? decodeURIComponent(match[1]) : null;
}

export const api = axios.create({
  baseURL: env.baseUrl,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getCookie(AUTH_COOKIE_KEY);

  if (token) {
    config.headers.Authorization ??= `Bearer ${token}`;
  }

  return config;
});
