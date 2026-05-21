import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Welcome from "./src/screens/user/Welcome";
import Login from "./src/screens/auth/Login";
import Register from "./src/screens/auth/Register";
import ForgotPassword from "./src/screens/auth/ForgotPassword";
import ResetPassword from "./src/screens/auth/ResetPassword";

import Home from "./src/screens/user/Home";
import MaintenanceRequest from "./src/screens/user/MaintenanceRequest";
import MaintenanceHistory from "./src/screens/user/MaintenanceHistory";
import PaymentSuccess from "./src/screens/user/PaymentSuccess";
import Review from "./src/screens/user/Review";
import UserProfile from "./src/screens/user/UserProfile";

import TechnicianDashboard from "./src/screens/technician/TechnicianDashboard";
import TechnicianRequests from "./src/screens/technician/TechnicianRequests";
import TechnicianAvailability from "./src/screens/technician/TechnicianAvailability";
import TechnicianProfile from "./src/screens/technician/TechnicianProfile";
import TechniciansByService from "./src/screens/technician/TechniciansByService";

import ChatList from "./src/screens/ChatList";
import Chat from "./src/screens/Chat";
import AIChat from "./src/screens/AIChat";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome" component={Welcome} />

        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />

        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="MaintenanceRequest" component={MaintenanceRequest} />
        <Stack.Screen name="MaintenanceHistory" component={MaintenanceHistory} />
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
        <Stack.Screen name="Review" component={Review} />
        <Stack.Screen name="UserProfile" component={UserProfile} />

        <Stack.Screen name="TechnicianDashboard" component={TechnicianDashboard} />
        <Stack.Screen name="TechnicianRequests" component={TechnicianRequests} />
        <Stack.Screen name="TechnicianAvailability" component={TechnicianAvailability} />
        <Stack.Screen name="TechnicianProfile" component={TechnicianProfile} />
        <Stack.Screen name="TechniciansByService" component={TechniciansByService} />

        <Stack.Screen name="ChatList" component={ChatList} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="AIChat" component={AIChat} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}