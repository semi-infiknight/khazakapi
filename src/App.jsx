import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import ApiDetailPage from "./pages/ApiDetailPage.jsx";
import Layout from "./components/Layout.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/apis/:id" element={<ApiDetailPage />} />
      </Routes>
    </Layout>
  );
}
