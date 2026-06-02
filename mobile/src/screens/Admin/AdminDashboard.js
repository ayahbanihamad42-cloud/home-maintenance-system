import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

function TechnicianDashboard({ navigation }) {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    on_the_way: 0,
    in_progress: 0,
    completed: 0,
  });

  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      setMessage("");

      const raw = await AsyncStorage.getItem("user");
      const currentUser = raw ? JSON.parse(raw) : {};
      setUser(currentUser);

      const res = await API.get("/technicians/requests/my");
      const list = Array.isArray(res.data) ? res.data : [];

      const nextStats = {
        total: list.length,
        pending: 0,
        accepted: 0,
        on_the_way: 0,
        in_progress: 0,
        completed: 0,
      };

      list.forEach((item) => {
        const status = String(item.status || "").toLowerCase();

        if (Object.prototype.hasOwnProperty.call(nextStats, status)) {
          nextStats[status] += 1;
        }
      });

      setStats(nextStats);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to load technician dashboard."
      );
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", load);
    load();

    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Dashboard" />

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Technician Dashboard</Text>
          <Text style={appStyles.heroSubtitle}>
            Welcome {user.name || "Technician"}, manage your work and requests.
          </Text>
        </View>

        {message ? (
          <View style={appStyles.errorBox}>
            <Text style={appStyles.errorText}>{message}</Text>
          </View>
        ) : null}

        <View style={appStyles.grid}>
          <View style={appStyles.serviceCard}>
            <Text style={{ fontSize: 32, fontWeight: "900", color: "#7C3AED" }}>
              {stats.total}
            </Text>
            <Text style={appStyles.serviceName}>Total</Text>
          </View>

          <View style={appStyles.serviceCard}>
            <Text style={{ fontSize: 32, fontWeight: "900", color: "#7C3AED" }}>
              {stats.pending}
            </Text>
            <Text style={appStyles.serviceName}>Pending</Text>
          </View>

          <View style={appStyles.serviceCard}>
            <Text style={{ fontSize: 32, fontWeight: "900", color: "#7C3AED" }}>
              {stats.accepted}
            </Text>
            <Text style={appStyles.serviceName}>Accepted</Text>
          </View>

          <View style={appStyles.serviceCard}>
            <Text style={{ fontSize: 32, fontWeight: "900", color: "#7C3AED" }}>
              {stats.completed}
            </Text>
            <Text style={appStyles.serviceName}>Completed</Text>
          </View>
        </View>

        <View style={appStyles.card}>
          <Text style={appStyles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={appStyles.primaryBtn}
            onPress={() => navigation.navigate("TechnicianRequests")}
          >
            <Text style={appStyles.primaryBtnText}>Manage Requests</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={appStyles.secondaryBtn}
            onPress={() => navigation.navigate("TechnicianAvailability")}
          >
            <Text style={appStyles.secondaryBtnText}>Manage Availability</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={appStyles.secondaryBtn}
            onPress={() => navigation.navigate("TechnicianGalleryManager")}
          >
            <Text style={appStyles.secondaryBtnText}>Manage Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={appStyles.secondaryBtn}
            onPress={() => navigation.navigate("UserProfile")}
          >
            <Text style={appStyles.secondaryBtnText}>Profile Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default TechnicianDashboard;