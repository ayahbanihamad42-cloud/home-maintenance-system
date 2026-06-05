import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import CustomDropdown from "../../components/Common/CustomDropdown";
import {
  getMyTechnicianRequests,
  updateTechnicianRequestStatus,
} from "../../services/technicianService";
import appStyles, { colors } from "../../styles/mobileStyles";

const requestStatuses = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "On The Way", value: "on_the_way" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

function TechnicianRequests({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const normalizeStatus = (value) =>
    String(value || "").toLowerCase().replace(/\s+/g, "_");

  const formatDateOnly = (value) => (value ? String(value).slice(0, 10) : "-");
  const formatTimeOnly = (value) => (value ? String(value).slice(0, 8) : "-");

  const getUserLocation = (item) => {
    const lat = Number(item?.user_location_lat);
    const lng = Number(item?.user_location_lng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { latitude: lat, longitude: lng };
    }

    return null;
  };

  const getTechnicianLocation = (item) => {
    const lat = Number(
      item?.technician_location_lat ||
        item?.technician_lat ||
        item?.current_lat ||
        item?.latitude
    );

    const lng = Number(
      item?.technician_location_lng ||
        item?.technician_lng ||
        item?.current_lng ||
        item?.longitude
    );

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { latitude: lat, longitude: lng };
    }

    return null;
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const data = await getMyTechnicianRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setRequests([]);
      setMessage({
        type: "error",
        body: err?.response?.data?.message || "Failed to load requests.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", loadRequests);
    loadRequests();
    return unsub;
  }, [navigation]);

  const getCurrentLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      return null;
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };
  };

  const updateStatus = async (requestId, status) => {
    try {
      setUpdatingId(requestId);
      setMessage(null);

      const cleanStatus = normalizeStatus(status);
      let payload = { status: cleanStatus };

      if (cleanStatus === "on_the_way") {
        const loc = await getCurrentLocation();

        if (!loc) {
          setMessage({
            type: "error",
            body: "Please allow location access so the customer can track the technician.",
          });
          return;
        }

        payload = {
          status: cleanStatus,
          technician_location_lat: loc.lat,
          technician_location_lng: loc.lng,
        };
      }

      await updateTechnicianRequestStatus(requestId, payload);

      setMessage({
        type: "success",
        body:
          cleanStatus === "on_the_way"
            ? "Status updated and live location sent to the customer."
            : "Request status updated successfully.",
      });

      await loadRequests();
    } catch (err) {
      setMessage({
        type: "error",
        body: err?.response?.data?.message || "Failed to update request status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;

    return requests.filter(
      (item) => normalizeStatus(item.status) === normalizeStatus(statusFilter)
    );
  }, [requests, statusFilter]);

  const openCustomerChat = (item) => {
    const receiverId =
      item.user_id || item.customer_id || item.client_id || item.request_user_id;

    if (!receiverId) {
      Alert.alert("Chat", "Customer id is missing.");
      return;
    }

    global.openMobileChatWith?.({
      id: receiverId,
      name: item.user_name || item.customer_name || "Customer",
    });
  };

  const openMap = (loc) => {
    if (!loc) return;
    Linking.openURL(`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`);
  };

  const renderMap = (title, loc) => {
    if (!loc) return null;

    return (
      <View style={styles.mapCard}>
        <Text style={styles.mapTitle}>{title}</Text>

        <View style={styles.mapWrap}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: loc.latitude,
              longitude: loc.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={loc} title={title} />
          </MapView>
        </View>

        <TouchableOpacity style={appStyles.secondaryBtn} onPress={() => openMap(loc)}>
          <Text style={appStyles.secondaryBtnText}>Open Map</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderActions = (item) => {
    const status = normalizeStatus(item.status);
    const requestId = item.id || item.request_id;
    const disabled = updatingId === requestId;

    if (status === "pending") {
      return (
        <View style={appStyles.row}>
          <TouchableOpacity
            style={[appStyles.primaryBtn, { flex: 1 }]}
            disabled={disabled}
            onPress={() => updateStatus(requestId, "accepted")}
          >
            <Text style={appStyles.primaryBtnText}>
              {disabled ? "Updating..." : "Accept"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[appStyles.secondaryBtn, { flex: 1 }]}
            disabled={disabled}
            onPress={() => updateStatus(requestId, "rejected")}
          >
            <Text style={appStyles.secondaryBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (status === "accepted" || status === "confirmed") {
      return (
        <TouchableOpacity
          style={appStyles.primaryBtn}
          disabled={disabled}
          onPress={() => updateStatus(requestId, "on_the_way")}
        >
          <Text style={appStyles.primaryBtnText}>
            {disabled ? "Getting Location..." : "On The Way"}
          </Text>
        </TouchableOpacity>
      );
    }

    if (status === "on_the_way") {
      return (
        <TouchableOpacity
          style={appStyles.primaryBtn}
          disabled={disabled}
          onPress={() => updateStatus(requestId, "in_progress")}
        >
          <Text style={appStyles.primaryBtnText}>
            {disabled ? "Updating..." : "In Progress"}
          </Text>
        </TouchableOpacity>
      );
    }

    if (status === "in_progress") {
      return (
        <TouchableOpacity
          style={appStyles.primaryBtn}
          disabled={disabled}
          onPress={() => updateStatus(requestId, "completed")}
        >
          <Text style={appStyles.primaryBtnText}>
            {disabled ? "Updating..." : "Completed"}
          </Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Requests" />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <HeroSection
          title="Technician Requests"
          subtitle="Manage assigned maintenance requests and update their status."
        />

        <View style={styles.filterBox}>
          <View style={{ flex: 1 }}>
            <CustomDropdown
              label="Status"
              value={statusFilter}
              options={requestStatuses}
              onChange={setStatusFilter}
            />
          </View>

          <TouchableOpacity style={styles.clearBtn} onPress={() => setStatusFilter("all")}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {message ? (
          <View style={message.type === "error" ? appStyles.errorBox : appStyles.successBox}>
            <Text style={message.type === "error" ? appStyles.errorText : appStyles.successText}>
              {message.body}
            </Text>
          </View>
        ) : null}

        {loading ? (
          <View style={appStyles.card}>
            <Text style={appStyles.sectionTitle}>Loading...</Text>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={appStyles.card}>
            <Text style={appStyles.sectionTitle}>No requests found</Text>
          </View>
        ) : (
          filteredRequests.map((item) => {
            const requestId = item.id || item.request_id;
            const status = normalizeStatus(item.status);
            const userLoc = getUserLocation(item);
            const techLoc = getTechnicianLocation(item);

            return (
              <View style={appStyles.card} key={requestId}>
                <View style={appStyles.between}>
                  <Text style={appStyles.sectionTitle}>Request #{requestId}</Text>
                  <View style={appStyles.statusBadge}>
                    <Text style={appStyles.statusText}>
                      {status.replace(/_/g, " ")}
                    </Text>
                  </View>
                </View>

                <Text style={appStyles.text}>
                  Customer: {item.user_name || item.customer_name || "-"}
                </Text>
                <Text style={appStyles.text}>
                  Phone: {item.user_phone || "-"}
                </Text>
                <Text style={appStyles.text}>
                  Service: {item.service || item.service_type || "-"}
                </Text>
                <Text style={appStyles.text}>
                  Date: {formatDateOnly(item.scheduled_date)}
                </Text>
                <Text style={appStyles.text}>
                  Time: {formatTimeOnly(item.scheduled_time)}
                </Text>
                <Text style={appStyles.text}>
                  Payment: {item.payment_method || "-"}
                </Text>
                <Text style={appStyles.text}>
                  Total: {Number(item.total_price || item.amount || 0).toFixed(2)} JOD
                </Text>
                <Text style={appStyles.mutedText}>
                  Note: {item.location_note || item.city || "-"}
                </Text>
                <Text style={appStyles.mutedText}>
                  {item.description || "-"}
                </Text>

                {renderMap("Customer Location", userLoc)}

                {status === "on_the_way" && renderMap("Your Shared Live Location", techLoc)}

                {status === "accepted" ? (
                  <View style={appStyles.successBox}>
                    <Text style={appStyles.successText}>
                      When you press On The Way, your live location will be shared with the customer.
                    </Text>
                  </View>
                ) : null}

                <View style={appStyles.row}>
                  <TouchableOpacity
                    style={[appStyles.secondaryBtn, { flex: 1 }]}
                    onPress={() => openCustomerChat(item)}
                  >
                    <Text style={appStyles.secondaryBtnText}>Chat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[appStyles.secondaryBtn, { flex: 1 }]}
                    onPress={() => openMap(userLoc)}
                  >
                    <Text style={appStyles.secondaryBtnText}>Customer Map</Text>
                  </TouchableOpacity>
                </View>

                {renderActions(item)}
              </View>
            );
          })
        )}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 10,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clearBtn: {
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    justifyContent: "center",
    marginTop: 18,
  },
  clearText: {
    color: colors.primary,
    fontWeight: "900",
  },
  mapCard: {
    marginTop: 14,
    marginBottom: 10,
  },
  mapTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 10,
  },
  mapWrap: {
    height: 230,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default TechnicianRequests;