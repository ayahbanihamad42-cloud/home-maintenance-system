// React library
import React from "react";

// Routing utilities
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth pages
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

// User pages
import Welcome from "./pages/user/Welcome.jsx";
import Home from "./pages/user/Home.jsx";
import Profile from "./pages/user/UserProfile.jsx";
import MaintenanceHistory from "./pages/user/MaintenanceHistory.jsx";
import MaintenanceRequest from "./pages/user/MaintenanceRequest.jsx";
import Review from "./pages/user/Review.jsx";

// Technician pages (public to user for viewing / booking)
import TechniciansByService from "./pages/technician/TechniciansByService.jsx";
import TechnicianProfile from "./pages/technician/TechnicianProfile.jsx";

// Technician pages (technician-only)
import TechnicianAvailability from "./pages/technician/TechnicianAvailability.jsx";
import TechnicianRequests from "./pages/technician/TechnicianRequests.jsx";
import TechnicianDashboard from "./pages/technician/TechnicianDashboard.jsx";

// Admin page
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

// Chat & AI pages
import AIChat from "./pages/AIChat.jsx";
import Chat from "./pages/Chat.jsx";

// Route guards
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import AdminRedirect from "./components/common/AdminRedirect.jsx";

// App component
function App() {
  return (
    <Router>
      <Routes>
        {/* ================= Public Pages ================= */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Forgot/Reset Password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ================= Home (Logged-in users) ================= */}
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["user", "technician", "admin"]}>
              {/* Redirect admins automatically to /admin */}
              <AdminRedirect>
                <Home />
              </AdminRedirect>
            </ProtectedRoute>
          }
        />

        {/* ================= User Pages ================= */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user", "technician"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <MaintenanceHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/request"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <MaintenanceRequest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/request/:technicianId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <MaintenanceRequest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/review/:requestId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Review />
            </ProtectedRoute>
          }
        />

        {/* ================= Technician Discovery (User can view) ================= */}
        <Route
          path="/services/:service"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <TechniciansByService />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technician/:technicianId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <TechnicianProfile />
            </ProtectedRoute>
          }
        />

        {/* ================= Technician Pages (Technician only) ================= */}
        <Route
          path="/technician/availability"
          element={
            <ProtectedRoute allowedRoles={["technician"]}>
              <TechnicianAvailability />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technician/requests"
          element={
            <ProtectedRoute allowedRoles={["technician"]}>
              <TechnicianRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technician/dashboard"
          element={
            <ProtectedRoute allowedRoles={["technician"]}>
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= Admin ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= Chat & AI ================= */}
        <Route
          path="/ai-chat"
          element={
            <ProtectedRoute allowedRoles={["user", "technician"]}>
              <AIChat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:userId"
          element={
            <ProtectedRoute allowedRoles={["user", "technician"]}>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
