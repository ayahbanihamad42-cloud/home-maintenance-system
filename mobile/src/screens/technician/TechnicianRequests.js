import React, { useEffect, useMemo, useState } from "react";
import {
  Linking,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
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
import appStyles from "../../styles/mobileStyles";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "On the way", value: "on_the_way" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

const sortOptions = [
  { label: "Newest request", value: "newest" },
  { label: "Oldest request", value: "oldest" },
];

function TechnicianRequests({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("newest");
  const [updatingId, setUpdatingId] = useState(null);
  const [localTechLocations, setLocalTechLocations] = useState({});

  const formatDateOnly = (value) => {
    if (!value) return "-";
    const raw = String(value);
    const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : raw.slice(0, 10);
  };

  const formatTimeOnly = (value) => {
    if (!value) return "-";
    return String(value).slice(0, 8);
  };

  const getUserLocation = (item) => {
    const lat = Number(item?.user_location_lat);
    const lng = Number(item?.user_location_lng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }

    return null;
  };

  const getTechnicianLocation = (item) => {
    const local = localTechLocations[item.id];

    if (local) return local;

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
      return { lat, lng };
    }

    return null;
  };

  const openMap = (loc) => {
    if (!loc) return;
    Linking.openURL(`https://www.google.com/maps?q=${loc.lat},${loc.lng}`);
  };

  const loadRequests = async () => {
    try {
      setMessage(null);

      const data = await getMyTechnicianRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setRequests([]);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load requests.",
      });
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadRequests);
    loadRequests();

    return unsubscribe;
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

      let locationPayload = {};

      if (status === "on_the_way") {
        const loc = await getCurrentLocation();

        if (!loc) {
          setMessage({
            type: "error",
            text:
              "Please allow location access so the customer can track your location.",
          });
          return;
        }

        locationPayload = {
          technician_location_lat: loc.lat,
          technician_location_lng: loc.lng,
          technician_lat: loc.lat,
          technician_lng: loc.lng,
          current_lat: loc.lat,
          current_lng: loc.lng,
          latitude: loc.lat,
          longitude: loc.lng,
        };

        setLocalTechLocations((prev) => ({
          ...prev,
          [requestId]: loc,
        }));
      }

      await updateTechnicianRequestStatus(requestId, status, locationPayload);

      setMessage({
        type: "success",
        text:
          status === "on_the_way"
            ? "Status updated and your live location has been shared with the customer."
            : "Request status updated successfully.",
      });

      await loadRequests();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to update request status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (statusFilter !== "all") {
      result = result.filter(
        (item) => String(item.status || "").toLowerCase() === statusFilter
      );
    }

    result.sort((a, b) => {
      if (sortFilter === "oldest") {
        return Number(a.id || 0) - Number(b.id || 0);
      }

      return Number(b.id || 0) - Number(a.id || 0);
    });

    return result;
  }, [requests, statusFilter, sortFilter]);

  const nextButton = (item) => {
    const status = String(item.status || "").toLowerCase();
    const disabled = updatingId === item.id;

    if (status === "pending") {
      return (
        <View style={appStyles.row}>
          <TouchableOpacity
            style={[appStyles.primaryBtn, { flex: 1 }]}
            disabled={disabled}
            onPress={() => updateStatus(item.id, "accepted")}
          >
            <Text style={appStyles.primaryBtnText}>
              {disabled ? "Updating..." : "Accept"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[appStyles.dangerBtn, { flex: 1 }]}
            disabled={disabled}
            onPress={() => updateStatus(item.id, "rejected")}
          >
            <Text style={appStyles.dangerBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (status === "accepted" || status === "confirmed") {
      return (
        <TouchableOpacity
          style={appStyles.primaryBtn}
          disabled={disabled}
          onPress={() => updateStatus(item.id, "on_the_way")}
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
          onPress={() => updateStatus(item.id, "in_progress")}
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
          onPress={() => updateStatus(item.id, "completed")}
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

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection
          title="Technician Requests"
          subtitle="Manage assigned maintenance requests and update their status."
        />

        {message ? (
          <View
            style={
              message.type === "success"
                ? appStyles.successBox
                : appStyles.errorBox
            }
          >
            <Text
              style={
                message.type === "success"
                  ? appStyles.successText
                  : appStyles.errorText
              }
            >
              {message.text}
            </Text>
          </View>
        ) : null}

        <View style={appStyles.card}>
          <CustomDropdown
            label="Status Filter"
            value={statusFilter}
            options={statusOptions}
            onChange={setStatusFilter}
          />

          <CustomDropdown
            label="Sort"
            value={sortFilter}
            options={sortOptions}
            onChange={setSortFilter}
          />

          <TouchableOpacity
            style={appStyles.secondaryBtn}
            onPress={() => {
              setStatusFilter("all");
              setSortFilter("newest");
            }}
          >
            <Text style={appStyles.secondaryBtnText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>

        {filteredRequests.length === 0 ? (
          <View style={appStyles.card}>
            <Text style={appStyles.sectionTitle}>No requests found</Text>
          </View>
        ) : (
          filteredRequests.map((item) => {
            const userLoc = getUserLocation(item);
            const techLoc = getTechnicianLocation(item);
            const status = String(item.status || "").toLowerCase();

            return (
              <View style={appStyles.card} key={item.id}>
                <View style={appStyles.between}>
                  <Text style={appStyles.sectionTitle}>
                    {item.service || "-"}
                  </Text>

                  <View style={appStyles.statusBadge}>
                    <Text style={appStyles.statusText}>
                      {String(item.status || "-").replaceAll("_", " ")}
                    </Text>
                  </View>
                </View>

                <Text style={appStyles.text}>
                  User: {item.user_name || item.customer_name || "-"}
                </Text>
                <Text style={appStyles.text}>
                  Phone: {item.user_phone || "-"}
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
                  Total:{" "}
                  {Number(item.total_price || item.amount || 0).toFixed(2)} JOD
                </Text>
                <Text style={appStyles.text}>
                  Note: {item.location_note || item.city || "-"}
                </Text>

                {userLoc && (
                  <View style={[appStyles.card, { marginTop: 14 }]}>
                    <Text style={appStyles.sectionTitle}>Customer Location</Text>

                    <MapView
                      style={{
                        width: "100%",
                        height: 230,
                        borderRadius: 22,
                        overflow: "hidden",
                      }}
                      initialRegion={{
                        latitude: userLoc.lat,
                        longitude: userLoc.lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                    >
                      <Marker
                        coordinate={{
                          latitude: userLoc.lat,
                          longitude: userLoc.lng,
                        }}
                        title="Customer Location"
                      />
                    </MapView>

                    <TouchableOpacity
                      style={appStyles.secondaryBtn}
                      onPress={() => openMap(userLoc)}
                    >
                      <Text style={appStyles.secondaryBtnText}>
                        Open Customer Location
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {status === "accepted" && (
                  <View style={appStyles.successBox}>
                    <Text style={appStyles.successText}>
                      When you press On The Way, your live location will be
                      shared with the customer.
                    </Text>
                  </View>
                )}

                {techLoc && (
                  <View style={[appStyles.card, { marginTop: 14 }]}>
                    <Text style={appStyles.sectionTitle}>Your Live Location</Text>

                    <MapView
                      style={{
                        width: "100%",
                        height: 230,
                        borderRadius: 22,
                        overflow: "hidden",
                      }}
                      initialRegion={{
                        latitude: techLoc.lat,
                        longitude: techLoc.lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                    >
                      <Marker
                        coordinate={{
                          latitude: techLoc.lat,
                          longitude: techLoc.lng,
                        }}
                        title="Technician Location"
                      />
                    </MapView>

                    <TouchableOpacity
                      style={appStyles.secondaryBtn}
                      onPress={() => openMap(techLoc)}
                    >
                      <Text style={appStyles.secondaryBtnText}>
                        Open My Live Location
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {status === "on_the_way" && (
                  <View style={appStyles.successBox}>
                    <Text style={appStyles.successText}>
                      Your live location has been shared with the customer.
                    </Text>
                  </View>
                )}

                <Text style={[appStyles.mutedText, { marginTop: 10 }]}>
                  {item.description || "-"}
                </Text>

                {nextButton(item)}
              </View>
            );
          })
        )}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default TechnicianRequests;