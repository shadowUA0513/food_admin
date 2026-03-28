import { useEffect, useState } from "react";
import HomePage from "../../pages/home/HomePage";
import LoginPage from "../../pages/login/LoginPage";
import { useAuth } from "../providers/AuthProvider";
import { ProtectedRoute } from "./ProtectedRoute";

const HOME_ROUTE = "/";
const LOGIN_ROUTE = "/login";

export function AppRouter() {
  const { isAuthenticated } = useAuth();
  const [pathname, setPathname] = useState(window.location.pathname || LOGIN_ROUTE);

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname || LOGIN_ROUTE);
    };

    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  const goTo = (nextPath: string, replace = false) => {
    const method = replace ? "replaceState" : "pushState";

    window.history[method](null, "", nextPath);
    setPathname(nextPath);
  };

  if (pathname === LOGIN_ROUTE) {
    if (isAuthenticated) {
      goTo(HOME_ROUTE, true);
      return null;
    }

    return <LoginPage onSuccess={() => goTo(HOME_ROUTE)} />;
  }

  if (pathname === HOME_ROUTE) {
    return (
      <ProtectedRoute isAllowed={isAuthenticated} onDeny={() => goTo(LOGIN_ROUTE, true)}>
        <HomePage onLogout={() => goTo(LOGIN_ROUTE, true)} />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute isAllowed={isAuthenticated} onDeny={() => goTo(LOGIN_ROUTE, true)}>
      <HomePage onLogout={() => goTo(LOGIN_ROUTE, true)} />
    </ProtectedRoute>
  );
}
