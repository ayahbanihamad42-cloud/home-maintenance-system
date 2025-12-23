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
<<<<<<< HEAD
import RatingReview from "./pages/RatingReview";
import AdminDashboard from "./pages/AdminDashboard";
=======
import AdminDashboard from "./pages/AdminDashboard";
import Review from "./pages/Review";
import UserProfile from "./pages/UserProfile";
import Chat from "./pages/Chat";
import AIChat from "./pages/AIChat";
>>>>>>> 18ddf70f8e35674fe8b300ffd71259bd8cf758bd

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
<<<<<<< HEAD
        <Route path="/rating/:id" element={<RatingReview />} />
        <Route path="/admin" element={<AdminDashboard />} />
=======
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/Review/:techId" element={<Review />} />

        <Route path="/profile" element={<UserProfile />} />
        <Route path="/chat/:requestId" element={<Chat />} />
        <Route path="/aichat" element={<AIChat />} />
>>>>>>> 18ddf70f8e35674fe8b300ffd71259bd8cf758bd
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
