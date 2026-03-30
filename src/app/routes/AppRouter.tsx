import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "../layouts/AdminLayout";
import AddCompanies from "../../pages/companies/AddCompanies";
import AddCategory from "../../pages/company-details/AddCategory";
import AddProduct from "../../pages/company-details/AddProduct";
import CompanyCategoryPage from "../../pages/company-details/CompanyCategoryPage";
import CompanyDetailsPage from "../../pages/company-details/CompanyDetailsPage";
import CompanyProductPage from "../../pages/company-details/CompanyProductPage";
import CompaniesPage from "../../pages/companies/CompaniesPage";
import EditCompanies from "../../pages/companies/EditCompanies";
import EditCategory from "../../pages/company-details/EditCategory";
import EditProduct from "../../pages/company-details/EditProduct";
import HomePage from "../../pages/home/HomePage";
import LoginPage from "../../pages/login/LoginPage";
import AddStaff from "../../pages/staff/AddStaff";
import EditStaff from "../../pages/staff/EditStaff";
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
          <Route path="/companies/:companyId" element={<CompanyDetailsPage />}>
            <Route
              index
              element={<Navigate to="category" replace />}
            />
            <Route path="category" element={<CompanyCategoryPage />}>
              <Route path="add-category" element={<AddCategory />} />
              <Route path="edit/:categoryId" element={<EditCategory />} />
            </Route>
            <Route path="product" element={<CompanyProductPage />}>
              <Route path="add-product" element={<AddProduct />} />
              <Route path="edit/:productId" element={<EditProduct />} />
            </Route>
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/staff" element={<StaffPage />}>
              <Route path="add" element={<AddStaff />} />
              <Route path="edit/:staffId" element={<EditStaff />} />
            </Route>
            <Route path="/companies" element={<CompaniesPage />}>
              <Route path="add" element={<AddCompanies />} />
              <Route path="edit/:companyId" element={<EditCompanies />} />
            </Route>
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
