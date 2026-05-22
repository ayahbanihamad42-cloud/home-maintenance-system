import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider } from "./src/context/AuthContext";
import ProtectedRoute from "./src/components/Common/ProtectedRoute";
import AdminRedirect from "./src/components/Common/AdminRedirect";

import Welcome from "./src/screens/user/Welcome";
import Login from "./src/screens/auth/Login";
import Register from "./src/screens/auth/Register";
import ForgotPassword from "./src/screens/auth/ForgotPassword";
import ResetPassword from "./src/screens/auth/ResetPassword";

import Home from "./src/screens/user/Home";
import MaintenanceRequest from "./src/screens/user/MaintenanceRequest";
import MaintenanceHistory from "./src/screens/user/MaintenanceHistory";
import PaymentForm from "./src/screens/user/PaymentForm";
import PaymentSuccess from "./src/screens/user/PaymentSuccess";
import Review from "./src/screens/user/Review";
import UserProfile from "./src/screens/user/UserProfile";

import TechnicianDashboard from "./src/screens/technician/TechnicianDashboard";
import TechnicianRequests from "./src/screens/technician/TechnicianRequests";
import TechnicianAvailability from "./src/screens/technician/TechnicianAvailability";
import TechnicianProfile from "./src/screens/technician/TechnicianProfile";
import TechniciansByService from "./src/screens/technician/TechniciansByService";

import AdminDashboard from "./src/screens/Admin/AdminDashboard";

import ChatList from "./src/screens/ChatList";
import Chat from "./src/screens/Chat";
import AIChat from "./src/screens/AIChat";

const Stack = createNativeStackNavigator();

function UserScreen({ children }) {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <AdminRedirect>{children}</AdminRedirect>
    </ProtectedRoute>
  );
}

function TechnicianScreen({ children }) {
  return (
    <ProtectedRoute allowedRoles={["technician"]}>
      {children}
    </ProtectedRoute>
  );
}

function SharedScreen({ children }) {
  return (
    <ProtectedRoute allowedRoles={["user", "technician", "admin"]}>
      {children}
    </ProtectedRoute>
  );
}

function AdminScreen({ children }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {children}
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Welcome" component={Welcome} />

          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />

          <Stack.Screen name="Home">
            {(props) => (
              <UserScreen>
                <Home {...props} />
              </UserScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="MaintenanceRequest">
            {(props) => (
              <UserScreen>
                <MaintenanceRequest {...props} />
              </UserScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="MaintenanceHistory">
            {(props) => (
              <UserScreen>
                <MaintenanceHistory {...props} />
              </UserScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="PaymentForm">
            {(props) => (
              <UserScreen>
                <PaymentForm {...props} />
              </UserScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="PaymentSuccess">
            {(props) => (
              <UserScreen>
                <PaymentSuccess {...props} />
              </UserScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="Review">
            {(props) => (
              <UserScreen>
                <Review {...props} />
              </UserScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="UserProfile">
            {(props) => (
              <SharedScreen>
                <UserProfile {...props} />
              </SharedScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="TechnicianDashboard">
            {(props) => (
              <TechnicianScreen>
                <TechnicianDashboard {...props} />
              </TechnicianScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="TechnicianRequests">
            {(props) => (
              <TechnicianScreen>
                <TechnicianRequests {...props} />
              </TechnicianScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="TechnicianAvailability">
            {(props) => (
              <TechnicianScreen>
                <TechnicianAvailability {...props} />
              </TechnicianScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="TechnicianProfile">
            {(props) => (
              <SharedScreen>
                <TechnicianProfile {...props} />
              </SharedScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="TechniciansByService">
            {(props) => (
              <UserScreen>
                <TechniciansByService {...props} />
              </UserScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="AdminDashboard">
            {(props) => (
              <AdminScreen>
                <AdminDashboard {...props} />
              </AdminScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="ChatList">
            {(props) => (
              <SharedScreen>
                <ChatList {...props} />
              </SharedScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="Chat">
            {(props) => (
              <SharedScreen>
                <Chat {...props} />
              </SharedScreen>
            )}
          </Stack.Screen>

          <Stack.Screen name="AIChat">
            {(props) => (
              <SharedScreen>
                <AIChat {...props} />
              </SharedScreen>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}