import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AUTH_COOKIE_KEY } from "../service/api/constant";
import { loginRequest, type LoginPayload, type LoginUser } from "../service/auth";

interface AuthStore {
  isAuthenticated: boolean;
  phone: string | null;
  user: LoginUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      phone: null,
      user: null,
      isLoading: false,
      login: async (payload) => {
        set({ isLoading: true });

        try {
          const session = await loginRequest(payload);

          if (session.token) {
            setCookie(AUTH_COOKIE_KEY, session.token);
          }

          set({
            isAuthenticated: true,
            phone: session.phone,
            user: session.user,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: () => {
        clearCookie(AUTH_COOKIE_KEY);
        set({
          isAuthenticated: false,
          phone: null,
          user: null,
          isLoading: false,
        });
      },
    }),
    {
      name: "food-admin-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        phone: state.phone,
        user: state.user,
      }),
    },
  ),
);
