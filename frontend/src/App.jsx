import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/user/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/user/UserProfile";
import TechnicianProfile from "./pages/technician/TechnicianProfile";
import TechniciansByService from "./pages/technician/TechniciansByService";
import Welcome from "./pages/user/Welcome";
import MaintenanceHistory from "./pages/user/MaintenanceHistory";
import MaintenanceRequest from "./pages/user/MaintenanceRequest";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AIChat from "./pages/AIChat";
import Chat from "./pages/Chat";
import Review from "./pages/Review";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<MaintenanceHistory />} />
        <Route path="/request" element={<MaintenanceRequest />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/technician/:technicianId" element={<TechnicianProfile />} />
        <Route path="/services/:service" element={<TechniciansByService />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/chat" element={<Chat />} />

        <Route path="/review/:requestId" element={<Review />} />
      </Routes>
    </Router>
  );
}

export default App;
