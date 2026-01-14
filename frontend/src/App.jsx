import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import Home from "./pages/user/Home.jsx";
import Welcome from "./pages/user/Welcome.jsx";
import Profile from "./pages/user/UserProfile.jsx";
import MaintenanceHistory from "./pages/user/MaintenanceHistory.jsx";
import MaintenanceRequest from "./pages/user/MaintenanceRequest.jsx";
import TechnicianProfile from "./pages/technician/TechnicianProfile.jsx";
import TechniciansByService from "./pages/technician/TechniciansByService.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AIChat from "./pages/AIChat.jsx";
import Chat from "./pages/Chat.jsx";
import Review from "./pages/user/Review.jsx";
import TechnicianAvailability from "./pages/technician/TechnicianAvailability.jsx";
import TechnicianRequests from "./pages/technician/TechnicianRequests.jsx";
import TechnicianDashboard from "./pages/technician/TechnicianDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRedirect from "./components/common/AdminRedirect.jsx";
function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <AdminRedirect>
              <Welcome />
            </AdminRedirect>
          }
        />
        <Route
          path="/home"
          element={
            <AdminRedirect>
              <Home />
            </AdminRedirect>
          }
        />
        <Route
          path="/profile"
          element={
            <AdminRedirect>
              <Profile />
            </AdminRedirect>
          }
        />
        <Route
          path="/history"
          element={
            <AdminRedirect>
              <MaintenanceHistory />
            </AdminRedirect>
          }
        />
        <Route
          path="/request"
          element={
            <AdminRedirect>
              <MaintenanceRequest />
            </AdminRedirect>
          }
        />
        <Route
          path="/request/:technicianId"
          element={
            <AdminRedirect>
              <MaintenanceRequest />
            </AdminRedirect>
          }
        />

        <Route
          path="/login"
          element={
            <AdminRedirect>
              <Login />
            </AdminRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <AdminRedirect>
              <Register />
            </AdminRedirect>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AdminRedirect>
              <ForgotPassword />
            </AdminRedirect>
          }
        />

        <Route
          path="/services/:service"
          element={
            <AdminRedirect>
              <TechniciansByService />
            </AdminRedirect>
          }
        />
        <Route
          path="/technician/:technicianId"
          element={
            <AdminRedirect>
              <TechnicianProfile />
            </AdminRedirect>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-chat"
          element={
            <AdminRedirect>
              <AIChat />
            </AdminRedirect>
          }
        />
        <Route
          path="/chat/:userId"
          element={
            <AdminRedirect>
              <Chat />
            </AdminRedirect>
          }
        />

        <Route
          path="/review/:requestId"
          element={
            <AdminRedirect>
              <Review />
            </AdminRedirect>
          }
        />
        <Route
          path="/technician/availability"
          element={
            <AdminRedirect>
              <ProtectedRoute allowedRoles={["technician"]}>
                <TechnicianAvailability />
              </ProtectedRoute>
            </AdminRedirect>
          }
        />
        <Route
          path="/technician/requests"
          element={
            <AdminRedirect>
              <ProtectedRoute allowedRoles={["technician"]}>
                <TechnicianRequests />
              </ProtectedRoute>
            </AdminRedirect>
          }
        />
        <Route
          path="/technician/dashboard"
          element={
            <AdminRedirect>
              <ProtectedRoute allowedRoles={["technician"]}>
                <TechnicianDashboard />
              </ProtectedRoute>
            </AdminRedirect>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
