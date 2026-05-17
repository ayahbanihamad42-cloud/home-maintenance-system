import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import Header from "../../components/Common/Header";
import { getTechnicians } from "../../services/technicianService";

function TechniciansByService() {
  const route = useRoute();
  const navigation = useNavigation();

  const { service } = route.params || {};

  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  const [resultType, setResultType] = useState("technicians");
  const [priceFilter, setPriceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    setLoading(true);

    getTechnicians(service)
      .then((data) => setTechnicians(data || []))
      .catch(() => setTechnicians([]))
      .finally(() => setLoading(false));
  }, [service]);

  const cities = useMemo(() => {
    const result = [];

    technicians.forEach((tech) => {
      if (tech.city && !result.includes(tech.city)) {
        result.push(tech.city);
      }
    });

    return result;
  }, [technicians]);

  const filteredTechnicians = useMemo(() => {
    if (resultType === "stores") return [];

    let result = [...technicians];

    if (priceFilter === "low") {
      result = result.filter((t) => Number(t.price_per_hour || 0) <= 10);
    }

    if (priceFilter === "mid") {
      result = result.filter(
        (t) =>
          Number(t.price_per_hour || 0) > 10 &&
          Number(t.price_per_hour || 0) <= 25
      );
    }

    if (priceFilter === "high") {
      result = result.filter((t) => Number(t.price_per_hour || 0) > 25);
    }

    if (locationFilter !== "all") {
      result = result.filter((t) => t.city === locationFilter);
    }

    if (ratingFilter !== "all") {
      result = result.filter(
        (t) => Number(t.rating || 0) >= Number(ratingFilter)
      );
    }

    return result;
  }, [technicians, resultType, priceFilter, locationFilter, ratingFilter]);

  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{service} Technicians</Text>

        <View style={styles.filterRow}>
          <View style={styles.filterPill}>
            <Picker selectedValue={resultType} onValueChange={setResultType}>
              <Picker.Item label="Technicians" value="technicians" />
              <Picker.Item label="Stores" value="stores" />
            </Picker>
          </View>

          <View style={styles.filterPill}>
            <Picker selectedValue={priceFilter} onValueChange={setPriceFilter}>
              <Picker.Item label="All prices" value="all" />
              <Picker.Item label="Low" value="low" />
              <Picker.Item label="Medium" value="mid" />
              <Picker.Item label="High" value="high" />
            </Picker>
          </View>

          <View style={styles.filterPill}>
            <Picker
              selectedValue={locationFilter}
              onValueChange={setLocationFilter}
            >
              <Picker.Item label="All locations" value="all" />

              {cities.map((city) => (
                <Picker.Item key={city} label={city} value={city} />
              ))}
            </Picker>
          </View>

          <View style={styles.filterPill}>
            <Picker selectedValue={ratingFilter} onValueChange={setRatingFilter}>
              <Picker.Item label="All ratings" value="all" />
              <Picker.Item label="5+" value="5" />
              <Picker.Item label="4+" value="4" />
              <Picker.Item label="3+" value="3" />
            </Picker>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#111" />
        ) : resultType === "stores" ? (
          <Text style={styles.emptyText}>Store results will be connected later.</Text>
        ) : filteredTechnicians.length === 0 ? (
          <Text style={styles.emptyText}>No technicians found.</Text>
        ) : (
          filteredTechnicians.map((tech) => (
            <View style={styles.card} key={tech.technicianId}>
              <Text style={styles.cardTitle}>{tech.name}</Text>
              <Text style={styles.cardSubtitle}>{tech.service}</Text>

              <Text style={styles.info}>Experience: {tech.experience} years</Text>

              <Text style={styles.info}>
                Location: {tech.city || "Not provided"}
              </Text>

              <Text style={styles.info}>
                Price: {Number(tech.price_per_hour || 0).toFixed(2)} JOD/hr
              </Text>

              <Text style={styles.info}>
                Rating: ⭐ {Number(tech.rating || 0).toFixed(1)}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    navigation.navigate("TechnicianProfile", {
                      technicianId: tech.technicianId,
                    })
                  }
                >
                  <Text style={styles.buttonText}>View Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    navigation.navigate("MaintenanceRequest", {
                      technicianId: tech.technicianId,
                    })
                  }
                >
                  <Text style={styles.buttonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#E8DCCF",
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  filterPill: {
    width: "47%",
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    backgroundColor: "#F6EDE2",
    overflow: "hidden",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },
  cardSubtitle: {
    color: "#3A3028",
    marginVertical: 8,
  },
  info: {
    color: "#3A3028",
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
  },
  emptyText: {
    color: "#3A3028",
    textAlign: "center",
    marginTop: 20,
  },
});

export default TechniciansByService;