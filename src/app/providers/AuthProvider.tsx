import type { PropsWithChildren } from "react";
import { useAuthStore } from "../../store/auth";

export function AuthProvider({ children }: PropsWithChildren) {
  return children;
}

export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const email = useAuthStore((state) => state.email);
  const phone = useAuthStore((state) => state.phone);
  const user = useAuthStore((state) => state.user);
  const company = useAuthStore((state) => state.company);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const completeMfaLogin = useAuthStore((state) => state.completeMfaLogin);
  const logout = useAuthStore((state) => state.logout);

  return {
    isAuthenticated,
    email,
    phone,
    user,
    company,
    isLoading,
    login,
    completeMfaLogin,
    logout,
  };
}

export function useActiveCompanyId(routeCompanyId?: string) {
  const companyId = useAuthStore((state) => state.company?.id);

  return routeCompanyId ?? companyId;
}
