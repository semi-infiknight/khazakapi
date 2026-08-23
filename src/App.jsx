import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import ApiDetailPage from "./pages/ApiDetailPage.jsx";
import ServiceHubPage from "./pages/ServiceHubPage.jsx";
import EgovKeyPage from "./pages/EgovKeyPage.jsx";
import Layout from "./components/Layout.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup/data-egov-key" element={<EgovKeyPage />} />
        <Route path="/services/:serviceSlug" element={<ServiceHubPage />} />
        <Route path="/services/:serviceSlug/:apiId" element={<ServiceHubPage />} />
        <Route path="/apis/:id" element={<ApiDetailPage />} />
      </Routes>
    </Layout>
  );
}
