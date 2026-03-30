import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "../layouts/AdminLayout";
import CompaniesPage from "../../pages/companies/CompaniesPage";
import HomePage from "../../pages/home/HomePage";
import LoginPage from "../../pages/login/LoginPage";
import StaffPage from "../../pages/staff/StaffPage";
import { useAuth } from "../providers/AuthProvider";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />
        <Route element={<ProtectedRoute isAllowed={isAuthenticated} />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/staff">
              <Route index element={<StaffPage />} />
              <Route path="add" element={<StaffPage />} />
              <Route path="edit/:staffId" element={<StaffPage />} />
            </Route>
            <Route path="/companies" element={<CompaniesPage />} />
          </Route>
        </Route>
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
