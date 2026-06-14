import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AUTH_STORAGE_KEY } from "../service/api/constant";
import { clearAuthSession, setAuthCookie } from "../service/api/session";
import { completeMfaLoginRequest, loginRequest } from "../service/auth";
import type {
  LoginCompany,
  LoginPayload,
  LoginResult,
  LoginUser,
  MfaLoginPayload,
} from "../types/auth";

interface AuthStore {
  isAuthenticated: boolean;
  email: string | null;
  phone: string | null;
  user: LoginUser | null;
  company: LoginCompany | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<LoginResult>;
  completeMfaLogin: (payload: MfaLoginPayload) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: null,
      phone: null,
      user: null,
      company: null,
      isLoading: false,
      login: async (payload) => {
        set({ isLoading: true });

        try {
          const result = await loginRequest(payload);

          if (result.status === "success") {
            setAuthCookie(result.session.token);
            set({
              isAuthenticated: true,
              email: result.session.email,
              phone: result.session.phone,
              user: result.session.user,
              company: result.session.company,
              isLoading: false,
            });
          }

          if (result.status === "mfa_required") {
            set({ isLoading: false });
          }

          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      completeMfaLogin: async (payload) => {
        set({ isLoading: true });

        try {
          const session = await completeMfaLoginRequest(payload);
          setAuthCookie(session.token);
          set({
            isAuthenticated: true,
            email: session.email,
            phone: session.phone,
            user: session.user,
            company: session.company,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: () => {
        clearAuthSession();
        set({
          isAuthenticated: false,
          email: null,
          phone: null,
          user: null,
          company: null,
          isLoading: false,
        });
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        email: state.email,
        phone: state.phone,
        user: state.user,
        company: state.company,
      }),
    },
  ),
);
