import { AxiosError } from "axios";
import { api } from "./api";
import type {
  AuthSession,
  LoginPayload,
  LoginResult,
  LoginResponse,
  MfaLoginPayload,
  MfaRequiredResponse,
} from "../types/auth";

type ApiEnvelope<T> = {
  error?: boolean;
  data?: T;
  message?: string;
};

function unwrapApiData<T>(responseData: T | ApiEnvelope<T>): T {
  if (
    responseData &&
    typeof responseData === "object" &&
    "data" in responseData &&
    responseData.data
  ) {
    return responseData.data;
  }

  return responseData as T;
}

function isMfaRequiredResponse(
  data: LoginResponse | MfaRequiredResponse,
): data is MfaRequiredResponse {
  return "mfa_token" in data;
}

function toAuthSession(data: LoginResponse): AuthSession {
  return {
    token: data.access_token,
    email: data.user.email ?? null,
    phone: data.user.phone_number ?? data.user.phone ?? null,
    user: data.user,
    company: data.company ?? null,
  };
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResult> {
  try {
    const response = await api.post<LoginResponse | MfaRequiredResponse>(
      "/api/v1/users/login",
      {
        email: payload.email,
        password: payload.password,
      },
    );

    const responseData = unwrapApiData(response.data);

    if (response.status === 202) {
      const mfaData = responseData as MfaRequiredResponse;

      return {
        status: "mfa_required",
        mfaToken: mfaData.mfa_token,
        message: mfaData.message ?? "mfa_required",
      };
    }

    if (isMfaRequiredResponse(responseData)) {
      return {
        status: "mfa_required",
        mfaToken: responseData.mfa_token,
        message: responseData.message ?? "mfa_required",
      };
    }

    return {
      status: "success",
      session: toAuthSession(responseData as LoginResponse),
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message =
      axiosError.response?.data?.message ??
      `Login failed with status ${axiosError.response?.status ?? "unknown"}.`;

    throw new Error(message);
  }
}

export async function completeMfaLoginRequest(payload: MfaLoginPayload) {
  try {
    const { data } = await api.post<LoginResponse | ApiEnvelope<LoginResponse>>(
      "/api/v1/users/login/mfa",
      {
        mfa_token: payload.mfa_token,
        ...(payload.code ? { code: payload.code } : {}),
        ...(payload.recovery_code ? { recovery_code: payload.recovery_code } : {}),
      },
    );

    return toAuthSession(unwrapApiData(data));
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message =
      axiosError.response?.data?.message ??
      `MFA login failed with status ${axiosError.response?.status ?? "unknown"}.`;

    throw new Error(message);
  }
}
