import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
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
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<MaintenanceHistory />} />
        <Route path="/request" element={<MaintenanceRequest />} />
        <Route path="/request/:technicianId" element={<MaintenanceRequest />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* الفنيين حسب الخدمة */}
        <Route path="/services/:service" element={<TechniciansByService />} />
        {/* بروفايل الفني */}
        <Route path="/technician/:technicianId" element={<TechnicianProfile />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/chat/:userId" element={<Chat />} />

        <Route path="/review/:requestId" element={<Review />} />
        <Route path="/technician/availability" element={<TechnicianAvailability />} />
        <Route path="/technician/requests" element={<TechnicianRequests />} />
        <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;