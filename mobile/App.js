import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import '@formatjs/intl-pluralrules/polyfill';
import "./src/i18n";

import AdminRedirect from "./src/components/Common/AdminRedirect";
import ProtectedRoute from "./src/components/Common/ProtectedRoute";

import Welcome from "./src/screens/user/Welcome";
import Login from "./src/screens/auth/Login";
import Register from "./src/screens/auth/Register";
import ForgotPassword from "./src/screens/auth/ForgotPassword";
import ResetPassword from "./src/screens/auth/ResetPassword";

import Home from "./src/screens/user/Home";
import UserProfile from "./src/screens/user/UserProfile";
import MaintenanceHistory from "./src/screens/user/MaintenanceHistory";
import MaintenanceRequest from "./src/screens/user/MaintenanceRequest";
import Review from "./src/screens/user/Review";
import PaymentForm from "./src/screens/user/PaymentForm";
import PaymentSuccess from "./src/screens/user/PaymentSuccess";

import TechnicianDashboard from "./src/screens/technician/TechnicianDashboard";
import TechnicianAvailability from "./src/screens/technician/TechnicianAvailability";
import TechnicianRequests from "./src/screens/technician/TechnicianRequests";
import TechnicianProfile from "./src/screens/technician/TechnicianProfile";
import TechniciansByService from "./src/screens/technician/TechniciansByService";
import TechnicianGalleryManager from "./src/screens/technician/TechnicianGalleryManager";
import GalleryPostDetails from "./src/screens/technician/GalleryPostDetails";

import AdminDashboard from "./src/screens/Admin/AdminDashboard";

import AIChat from "./src/screens/AIChat";
import Chat from "./src/screens/Chat";
import ChatList from "./src/screens/ChatList";

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  const { c } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size="large" color={c.primary} />
    </View>
  );
}

function SharedScreen({ children }) {
  return <AdminRedirect>{children}</AdminRedirect>;
}

function UserScreen({ children }) {
  return (
    <ProtectedRoute allowedRoles={["user", "technician", "admin"]}>
      <AdminRedirect>{children}</AdminRedirect>
    </ProtectedRoute>
  );
}

function TechnicianScreen({ children }) {
  return (
    <ProtectedRoute allowedRoles={["technician", "admin"]}>
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

function AppNavigator() {
  const { c } = useTheme();

  return (
    <NavigationContainer fallback={<LoadingScreen />}>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: {
            backgroundColor: c.bg,
          },
        }}
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

        <Stack.Screen name="UserProfile">
          {(props) => (
            <UserScreen>
              <UserProfile {...props} />
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

        <Stack.Screen name="MaintenanceRequest">
          {(props) => (
            <UserScreen>
              <MaintenanceRequest {...props} />
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

        <Stack.Screen name="TechnicianDashboard">
          {(props) => (
            <TechnicianScreen>
              <TechnicianDashboard {...props} />
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

        <Stack.Screen name="TechnicianRequests">
          {(props) => (
            <TechnicianScreen>
              <TechnicianRequests {...props} />
            </TechnicianScreen>
          )}
        </Stack.Screen>

        <Stack.Screen name="TechnicianGalleryManager">
          {(props) => (
            <TechnicianScreen>
              <TechnicianGalleryManager {...props} />
            </TechnicianScreen>
          )}
        </Stack.Screen>

        <Stack.Screen name="AdminDashboard">
          {(props) => (
            <AdminScreen>
              <AdminDashboard {...props} />
            </AdminScreen>
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
            <SharedScreen>
              <TechniciansByService {...props} />
            </SharedScreen>
          )}
        </Stack.Screen>

        <Stack.Screen name="GalleryPostDetails">
          {(props) => (
            <SharedScreen>
              <GalleryPostDetails {...props} />
            </SharedScreen>
          )}
        </Stack.Screen>

        <Stack.Screen name="AIChat">
          {(props) => (
            <UserScreen>
              <AIChat {...props} />
            </UserScreen>
          )}
        </Stack.Screen>

        <Stack.Screen name="Chat">
          {(props) => (
            <UserScreen>
              <Chat {...props} />
            </UserScreen>
          )}
        </Stack.Screen>

        <Stack.Screen name="ChatList">
          {(props) => (
            <UserScreen>
              <ChatList {...props} />
            </UserScreen>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
