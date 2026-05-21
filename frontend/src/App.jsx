import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Welcome from "./pages/user/Welcome";
import Home from "./pages/user/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import UserProfile from "./pages/user/UserProfile";
import MaintenanceHistory from "./pages/user/MaintenanceHistory";
import MaintenanceRequest from "./pages/user/MaintenanceRequest";
import PaymentSuccess from "./pages/user/PaymentSuccess";
import PaymentForm from "./pages/user/PaymentForm";
import Review from "./pages/user/Review";

import TechniciansByService from "./pages/technician/TechniciansByService";
import TechnicianProfile from "./pages/technician/TechnicianProfile";
import TechnicianDashboard from "./pages/technician/TechnicianDashboard";
import TechnicianAvailability from "./pages/technician/TechnicianAvailability";
import TechnicianRequests from "./pages/technician/TechnicianRequests";
import TechnicianGalleryManager from "./pages/technician/TechnicianGalleryManager";
import GalleryPostDetails from "./pages/technician/GalleryPostDetails";

import AdminDashboard from "./pages/admin/AdminDashboard";

import ChatList from "./pages/ChatList";
import Chat from "./pages/Chat";
import AIChat from "./pages/AIChat";

import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRedirect from "./components/common/AdminRedirect";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/welcome" element={<Welcome />} />

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
              <UserProfile />
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
          path="/payment"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <PaymentForm />
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
          path="/review/:requestId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Review />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technicians/:service"
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
          path="/technician-dashboard"
          element={
            <ProtectedRoute allowedRoles={["technician"]}>
              <TechnicianDashboard />
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
          path="/technician/gallery"
          element={
            <ProtectedRoute allowedRoles={["technician"]}>
              <TechnicianGalleryManager />
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
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
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

        <Route
          path="/ai"
          element={
            <ProtectedRoute allowedRoles={["user", "technician"]}>
              <AIChat />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;