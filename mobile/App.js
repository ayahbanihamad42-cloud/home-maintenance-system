import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Auth pages
import Welcome from "./pages/user/Welcome";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// User pages
import Home from "./pages/user/Home";
import Profile from "./pages/user/UserProfile";
import MaintenanceHistory from "./pages/user/MaintenanceHistory";
import MaintenanceRequest from "./pages/user/MaintenanceRequest";
import Review from "./pages/user/Review";

// Technician Discovery
import TechniciansByService from "./pages/technician/TechniciansByService";
import TechnicianProfile from "./pages/technician/TechnicianProfile";

// Technician-only pages
import TechnicianAvailability from "./pages/technician/TechnicianAvailability";
import TechnicianRequests from "./pages/technician/TechnicianRequests";
import TechnicianDashboard from "./pages/technician/TechnicianDashboard";

// Admin page
import AdminDashboard from "./pages/admin/AdminDashboard";

// Chat & AI
import AIChat from "./pages/AIChat";
import Chat from "./pages/Chat";

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false, // لإخفاء الهيدر الافتراضي واستخدام الهيدر الخاص بك
        }}
      >
        {/* ================= Public Screens ================= */}
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />

        {/* ================= User Screens ================= */}
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="History" component={MaintenanceHistory} />
        <Stack.Screen name="MaintenanceRequest" component={MaintenanceRequest} />
        <Stack.Screen name="Review" component={Review} />

        {/* ================= Technician Discovery ================= */}
        <Stack.Screen name="Services" component={TechniciansByService} />
        <Stack.Screen name="TechnicianProfile" component={TechnicianProfile} />

        {/* ================= Technician-only Screens ================= */}
        <Stack.Screen name="TechnicianAvailability" component={TechnicianAvailability} />
        <Stack.Screen name="TechnicianRequests" component={TechnicianRequests} />
        <Stack.Screen name="TechnicianDashboard" component={TechnicianDashboard} />

        {/* ================= Admin Screen ================= */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />

        {/* ================= Chat & AI ================= */}
        <Stack.Screen name="AIChat" component={AIChat} />
        <Stack.Screen name="Chat" component={Chat} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

