import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Header from "../../components/Common/Header";
import API from "../../services/api";
import styles from "../../styles/mobileStyles";

export default function TechniciansByService({ route, navigation }) {
  const service = route?.params?.service || route?.params?.serviceName || "";

  const [technicians, setTechnicians] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    loadTechnicians();
  }, [service]);

  const loadTechnicians = async () => {
    try {
      const safeService = encodeURIComponent(String(service).trim());
      const res = await API.get(`/technicians/service/${safeService}`);
      setTechnicians(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Alert.alert(
        "Notice",
        err?.response?.data?.message || "Failed to load technicians."
      );
      setTechnicians([]);
    }
  };

  const filteredTechnicians = technicians.filter((tech) => {
    const price = Number(tech.price_per_hour || 0);
    const rating = Number(tech.rating || 0);
    const city = String(tech.city || "").toLowerCase();

    const priceOk =
      priceFilter === "all" ||
      (priceFilter === "low" && price <= 25) ||
      (priceFilter === "mid" && price > 25 && price <= 50) ||
      (priceFilter === "high" && price > 50);

    const locationOk =
      locationFilter === "all" || city === locationFilter.toLowerCase();

    const ratingOk =
      ratingFilter === "all" ||
      (ratingFilter === "4" && rating >= 4) ||
      (ratingFilter === "3" && rating >= 3);

    return priceOk && locationOk && ratingOk;
  });

  const openProfile = (tech) => {
    navigation.navigate("TechnicianProfile", {
      technicianId:
        tech.technicianId || tech.technician_id || tech.id,
      tech,
    });
  };

  const openBooking = (tech) => {
    const technicianId =
      tech.technicianId || tech.technician_id || tech.id;

    if (!technicianId) {
      Alert.alert("Notice", "Technician id is missing.");
      return;
    }

    navigation.navigate("MaintenanceRequest", {
      technicianId,
      technicianName: tech.name,
      service: tech.service || service,
      price_per_hour: tech.price_per_hour || 0,
      tech,
    });
  };

  const openChat = (tech) => {
    const userId = tech.user_id || tech.userId;

    if (!userId) {
      Alert.alert("Notice", "Chat user is missing.");
      return;
    }

    navigation.navigate("Chat", {
      userId,
      name: tech.name,
    });
  };

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.pageContent}>
        <Text style={styles.pageTitle}>{service} Technicians</Text>

        <View style={styles.filterGrid}>
          <View style={styles.filterBox}>
            <Picker selectedValue="technicians" enabled={false}>
              <Picker.Item label="Technicians" value="technicians" />
            </Picker>
          </View>

          <View style={styles.filterBox}>
            <Picker selectedValue={priceFilter} onValueChange={setPriceFilter}>
              <Picker.Item label="All prices" value="all" />
              <Picker.Item label="25 JOD or less" value="low" />
              <Picker.Item label="26 - 50 JOD" value="mid" />
              <Picker.Item label="More than 50 JOD" value="high" />
            </Picker>
          </View>

          <View style={styles.filterBox}>
            <Picker
              selectedValue={locationFilter}
              onValueChange={setLocationFilter}
            >
              <Picker.Item label="All locations" value="all" />
              <Picker.Item label="Amman" value="amman" />
              <Picker.Item label="Irbid" value="irbid" />
              <Picker.Item label="Zarqa" value="zarqa" />
              <Picker.Item label="Ajloun" value="ajloun" />
              <Picker.Item label="Jerash" value="jerash" />
              <Picker.Item label="Mafraq" value="mafraq" />
              <Picker.Item label="Balqa" value="balqa" />
              <Picker.Item label="Madaba" value="madaba" />
              <Picker.Item label="Karak" value="karak" />
              <Picker.Item label="Tafilah" value="tafilah" />
              <Picker.Item label="Ma'an" value="maan" />
              <Picker.Item label="Aqaba" value="aqaba" />
            </Picker>
          </View>

          <View style={styles.filterBox}>
            <Picker selectedValue={ratingFilter} onValueChange={setRatingFilter}>
              <Picker.Item label="All ratings" value="all" />
              <Picker.Item label="4+ stars" value="4" />
              <Picker.Item label="3+ stars" value="3" />
            </Picker>
          </View>
        </View>

        {filteredTechnicians.length === 0 ? (
          <View style={styles.noticeCard}>
            <Text style={styles.emptyText}>No technicians found.</Text>
          </View>
        ) : (
          filteredTechnicians.map((tech) => (
            <TouchableOpacity
              key={tech.technicianId || tech.technician_id || tech.id}
              style={styles.card}
              onPress={() => openProfile(tech)}
              activeOpacity={0.9}
            >
              <Text style={styles.pageTitle}>{tech.name || "Technician"}</Text>
              <Text style={styles.cardTitle}>{tech.service || service}</Text>

              <Text style={styles.cardText}>City: {tech.city || "-"}</Text>
              <Text style={styles.cardText}>Phone: {tech.phone || "-"}</Text>
              <Text style={styles.cardText}>
                Experience: {tech.experience || 0} years
              </Text>
              <Text style={styles.cardText}>
                Price: {Number(tech.price_per_hour || 0).toFixed(2)} JOD/hour
              </Text>
              <Text style={styles.cardText}>
                Rating: ⭐ {Number(tech.rating || 0).toFixed(1)}
              </Text>

              <Text style={styles.cardText}>
                {tech.bio || "Experienced technician ready to help."}
              </Text>

              <View style={styles.rowButtons}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => openChat(tech)}
                >
                  <Text style={styles.primaryBtnText}>Send Message</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => openBooking(tech)}
                >
                  <Text style={styles.primaryBtnText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}