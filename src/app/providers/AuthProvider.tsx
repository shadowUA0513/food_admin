import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
  phone: string | null;
  login: (phone: string) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = "food-admin-auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    const savedPhone = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (savedPhone) {
      setPhone(savedPhone);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(phone),
      phone,
      login: (nextPhone: string) => {
        window.localStorage.setItem(AUTH_STORAGE_KEY, nextPhone);
        setPhone(nextPhone);
      },
      logout: () => {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        setPhone(null);
      },
    }),
    [phone],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
