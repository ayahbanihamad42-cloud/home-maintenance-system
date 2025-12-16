import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import TechniciansByService from "./pages/TechniciansByService";
import MaintenanceRequest from "./pages/MaintenanceRequest";
import MaintenanceHistory from "./pages/MaintenanceHistory";
import TechnicianProfile from "./pages/TechnicianProfile";
import RatingReview from "./pages/RatingReview";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/technicians/:serviceId" element={<TechniciansByService />} />
        <Route path="/request/:techId" element={<MaintenanceRequest />} />
        <Route path="/history" element={<MaintenanceHistory />} />
        <Route path="/technician/:id" element={<TechnicianProfile />} />
        <Route path="/rating/:id" element={<RatingReview />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
