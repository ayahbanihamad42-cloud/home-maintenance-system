import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

import Welcome from "./pages/user/Welcome.jsx";
import Home from "./pages/user/Home.jsx";
import Profile from "./pages/user/UserProfile.jsx";
import MaintenanceHistory from "./pages/user/MaintenanceHistory.jsx";
import MaintenanceRequest from "./pages/user/MaintenanceRequest.jsx";
import Review from "./pages/user/Review.jsx";
import PaymentSuccess from "./pages/user/PaymentSuccess.jsx";

import TechniciansByService from "./pages/technician/TechniciansByService.jsx";
import TechnicianProfile from "./pages/technician/TechnicianProfile.jsx";
import GalleryPostDetails from "./pages/technician/GalleryPostDetails.jsx";
import TechnicianAvailability from "./pages/technician/TechnicianAvailability.jsx";
import TechnicianRequests from "./pages/technician/TechnicianRequests.jsx";
import TechnicianDashboard from "./pages/technician/TechnicianDashboard.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

import AIChat from "./pages/AIChat.jsx";
import Chat from "./pages/Chat.jsx";
import ChatList from "./pages/ChatList";

import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import AdminRedirect from "./components/common/AdminRedirect.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["user", "technician", "admin"]}>
              <AdminRedirect>
                <Home />
              </AdminRedirect>
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/payment-success/:requestId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/technician/gallery/post/:postId"
          element={
            <ProtectedRoute allowedRoles={["user", "technician"]}>
              <GalleryPostDetails />
            </ProtectedRoute>
          }
        />

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
            <ProtectedRoute allowedRoles={["user", "technician"]}>
              <AIChat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute allowedRoles={["user", "technician"]}>
              <ChatList />
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