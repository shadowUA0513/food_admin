import { AxiosError } from "axios";
import { api } from "./api";

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface LoginUser {
  id: string;
  full_name: string;
  phone_number: string;
  role: string;
  tg_id: number;
  tg_user_name: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  user: LoginUser;
}

export interface AuthSession {
  token: string;
  phone: string;
  user: LoginUser;
}

export async function loginRequest(payload: LoginPayload) {
  try {
    const { data } = await api.post<LoginResponse>(
      "/api/v1/users/login",
      {
        Phone: payload.phone,
        Password: payload.password,
      },
      {
        headers: {
          Authorization: "basic",
        },
      },
    );

    return {
      token: data.access_token,
      phone: data.user.phone_number,
      user: data.user,
    } satisfies AuthSession;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message =
      axiosError.response?.data?.message ??
      `Login failed with status ${axiosError.response?.status ?? "unknown"}.`;

    throw new Error(message);
  }
}
