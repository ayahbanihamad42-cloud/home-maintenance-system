import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import CustomDropdown from "../../components/Common/CustomDropdown";
import API from "../../services/api";
import { getStyles } from "../../styles/mobileStyles";

function MaintenanceHistory({ navigation }) {
  const { t } = useTranslation();
  const { c } = useTheme();
  const appStyles = getStyles(c);

  const statusOptions = [
    { label: t("history.statusAll"), value: "all" },
    { label: t("history.statusPending"), value: "pending" },
    { label: t("history.statusAccepted"), value: "accepted" },
    { label: t("history.statusCompleted"), value: "completed" },
    { label: t("history.statusRejected"), value: "rejected" },
    { label: t("history.statusCancelled"), value: "cancelled" },
  ];

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");

  const loadHistory = async () => {
    try {
      setMessage("");
      const res = await API.get("/maintenance/my");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.requests)
        ? res.data.requests
        : [];
      setRequests(data);
    } catch (err) {
      setRequests([]);
      setMessage(err.response?.data?.message || t("history.loadFailed"));
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", loadHistory);
    loadHistory();
    return unsub;
  }, [navigation]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter(
      (r) => String(r.status || "").toLowerCase() === statusFilter
    );
  }, [requests, statusFilter]);

  const formatDate = (value) => {
    if (!value) return "-";
    return String(value).split("T")[0];
  };

  const openReview = (req) => {
    navigation.navigate("Review", {
      requestId: req.id || req.request_id,
      technicianId: req.technician_id || req.technicianId,
      technicianName: req.technician_name || req.tech_name,
      status: req.status,
    });
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title={t("history.headerTitle")} />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <HeroSection
          title={t("history.title")}
          subtitle={t("history.subtitle")}
        />

        {message ? (
          <View style={appStyles.errorBox}>
            <Text style={appStyles.errorText}>{message}</Text>
          </View>
        ) : null}

        <View style={[styles.filterBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={{ flex: 1 }}>
            <CustomDropdown
              label={t("history.statusLabel")}
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />
          </View>

          <TouchableOpacity
            style={[styles.clearBtn, { backgroundColor: c.primarySoft }]}
            onPress={() => setStatusFilter("all")}
          >
            <Text style={[styles.clearText, { color: c.primary }]}>{t("history.clear")}</Text>
          </TouchableOpacity>
        </View>

        {filteredRequests.length === 0 ? (
          <View style={appStyles.card}>
            <Text style={appStyles.sectionTitle}>{t("history.noRequests")}</Text>
          </View>
        ) : (
          filteredRequests.map((req) => {
            const requestId = req.id || req.request_id;
            const status = String(req.status || "pending").toLowerCase();

            return (
              <View style={appStyles.card} key={requestId}>
                <View style={appStyles.between}>
                  <Text style={appStyles.sectionTitle}>{t("history.requestNumber", { id: requestId })}</Text>
                  <View style={appStyles.statusBadge}>
                    <Text style={appStyles.statusText}>{status}</Text>
                  </View>
                </View>

                <Text style={appStyles.text}>
                  {t("history.service")}: {req.service || req.service_type || "-"}
                </Text>
                <Text style={appStyles.text}>
                  {t("history.technician")}: {req.technician_name || req.tech_name || "-"}
                </Text>
                <Text style={appStyles.text}>
                  {t("history.date")}: {formatDate(req.scheduled_date || req.date)}
                </Text>
                <Text style={appStyles.text}>
                  {t("history.time")}: {req.scheduled_time || req.time || "-"}
                </Text>
                <Text style={appStyles.text}>
                  {t("history.hours")}: {req.estimated_hours || "-"}
                </Text>
                <Text style={appStyles.text}>
                  {t("history.payment")}: {req.payment_method || "-"}
                </Text>
                <Text style={appStyles.text}>
                  {t("history.total")}: {req.total_price || req.amount || 0} JOD
                </Text>

                {req.description ? (
                  <Text style={appStyles.mutedText}>{req.description}</Text>
                ) : null}

                <TouchableOpacity
                  style={appStyles.primaryBtn}
                  onPress={() => openReview(req)}
                >
                  <Text style={appStyles.primaryBtnText}>
                    {status === "completed" ? t("history.addReview") : t("history.viewReview")}
                  </Text>
                </TouchableOpacity>
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
    borderWidth: 1,
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
    justifyContent: "center",
    marginTop: 18,
  },
  clearText: {
    fontWeight: "900",
  },
});

export default MaintenanceHistory;
