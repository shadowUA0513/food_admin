export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginUser {
  id: string;
  email?: string;
  name?: string;
  full_name?: string;
  phone?: string;
  phone_number?: string;
  role?: string;
  tg_id?: number;
  tg_user_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCompany {
  id: string;
  name: string;
}

export interface LoginResponse {
  access_token: string;
  user: LoginUser;
  company?: LoginCompany | null;
}

export interface MfaRequiredResponse {
  message: "mfa_required" | string;
  mfa_token: string;
}

export interface LoginSuccessResponse extends LoginResponse {
  user: LoginUser;
}

export interface MfaLoginPayload {
  mfa_token: string;
  code?: string;
  recovery_code?: string;
}

export interface AuthSession {
  token: string;
  email: string | null;
  phone: string | null;
  user: LoginUser;
  company: LoginCompany | null;
}

export type LoginResult =
  | {
      status: "success";
      session: AuthSession;
    }
  | {
      status: "mfa_required";
      mfaToken: string;
      message: string;
    };
