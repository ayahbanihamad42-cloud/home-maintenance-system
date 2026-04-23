import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider } from "./src/context/AuthContext";

// Auth screens
import Welcome from "./src/screens/user/Welcome";
import Login from "./src/screens/auth/Login";
import Register from "./src/screens/auth/Register";
import ForgotPassword from "./src/screens/auth/ForgotPassword";
import ResetPassword from "./src/screens/auth/ResetPassword";

// User screens
import Home from "./src/screens/user/Home";
import Profile from "./src/screens/user/UserProfile";
import MaintenanceHistory from "./src/screens/user/MaintenanceHistory";
import MaintenanceRequest from "./src/screens/user/MaintenanceRequest";
import Review from "./src/screens/user/Review";
import PaymentSuccess from "./src/screens/user/PaymentSuccess";

// Technician Discovery
import TechniciansByService from "./src/screens/technician/TechniciansByService";
import TechnicianProfile from "./src/screens/technician/TechnicianProfile";

// Technician-only screens
import TechnicianAvailability from "./src/screens/technician/TechnicianAvailability";
import TechnicianRequests from "./src/screens/technician/TechnicianRequests";
import TechnicianDashboard from "./src/screens/technician/TechnicianDashboard";

// Admin screen
import AdminDashboard from "./src/screens/Admin/AdminDashboard";

// Chat & AI
import AIChat from "./src/screens/AIChat";
import Chat from "./src/screens/Chat";
import ChatList from "./src/screens/ChatList";

// Route guards
import ProtectedRoute from "./src/components/Common/ProtectedRoute";
import AdminRedirect from "./src/components/Common/AdminRedirect";

const Stack = createStackNavigator();

function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Public Screens */}
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />

          {/* Home with admin redirect */}
          <Stack.Screen name="Home">
            {() => (
              <ProtectedRoute allowedRoles={["user", "technician", "admin"]}>
                <AdminRedirect>
                  <Home />
                </AdminRedirect>
              </ProtectedRoute>
            )}
          </Stack.Screen>

          {/* User + Technician shared */}
          <Stack.Screen name="Profile">
            {() => (
              <ProtectedRoute allowedRoles={["user", "technician"]}>
                <Profile />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="AIChat">
            {() => (
              <ProtectedRoute allowedRoles={["user", "technician"]}>
                <AIChat />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="ChatList">
            {() => (
              <ProtectedRoute allowedRoles={["user", "technician"]}>
                <ChatList />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="Chat">
            {() => (
              <ProtectedRoute allowedRoles={["user", "technician"]}>
                <Chat />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          {/* User-only screens */}
          <Stack.Screen name="History">
            {() => (
              <ProtectedRoute allowedRoles={["user"]}>
                <MaintenanceHistory />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="MaintenanceRequest">
            {() => (
              <ProtectedRoute allowedRoles={["user"]}>
                <MaintenanceRequest />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="Review">
            {() => (
              <ProtectedRoute allowedRoles={["user"]}>
                <Review />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="PaymentSuccess">
            {() => (
              <ProtectedRoute allowedRoles={["user"]}>
                <PaymentSuccess />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="Services">
            {() => (
              <ProtectedRoute allowedRoles={["user"]}>
                <TechniciansByService />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="TechnicianProfile">
            {() => (
              <ProtectedRoute allowedRoles={["user"]}>
                <TechnicianProfile />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          {/* Technician-only screens */}
          <Stack.Screen name="TechnicianAvailability">
            {() => (
              <ProtectedRoute allowedRoles={["technician"]}>
                <TechnicianAvailability />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="TechnicianRequests">
            {() => (
              <ProtectedRoute allowedRoles={["technician"]}>
                <TechnicianRequests />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="TechnicianDashboard">
            {() => (
              <ProtectedRoute allowedRoles={["technician"]}>
                <TechnicianDashboard />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          {/* Admin-only */}
          <Stack.Screen name="AdminDashboard">
            {() => (
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;