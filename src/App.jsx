import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import ApiDetailPage from "./pages/ApiDetailPage.jsx";
import CategoryBrowsePage from "./pages/CategoryBrowsePage.jsx";
import CompanyHubPage from "./pages/CompanyHubPage.jsx";
import ServiceRedirectPage from "./pages/ServiceRedirectPage.jsx";
import EgovKeyPage from "./pages/EgovKeyPage.jsx";
import McpServerPage from "./pages/McpServerPage.jsx";
import Layout from "./components/Layout.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup/data-egov-key" element={<EgovKeyPage />} />
        <Route path="/setup/mcp" element={<McpServerPage />} />
        <Route path="/browse/:categorySlug" element={<CategoryBrowsePage />} />
        <Route path="/browse/:categorySlug/:companySlug" element={<CompanyHubPage />} />
        <Route path="/browse/:categorySlug/:companySlug/:apiId" element={<CompanyHubPage />} />
        <Route path="/services/:serviceSlug" element={<ServiceRedirectPage />} />
        <Route path="/services/:serviceSlug/:apiId" element={<ServiceRedirectPage />} />
        <Route path="/apis/:id" element={<ApiDetailPage />} />
      </Routes>
    </Layout>
  );
}
