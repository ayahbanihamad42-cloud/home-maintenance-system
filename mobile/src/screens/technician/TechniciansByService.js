import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import CustomDropdown from "../../components/Common/CustomDropdown";
import API from "../../services/api";
import appStyles, { colors } from "../../styles/mobileStyles";

const cityOptions = [
  { label: "All Jordan cities", value: "all" },
  { label: "Amman", value: "Amman" },
  { label: "Irbid", value: "Irbid" },
  { label: "Zarqa", value: "Zarqa" },
  { label: "Aqaba", value: "Aqaba" },
  { label: "Mafraq", value: "Mafraq" },
  { label: "Jerash", value: "Jerash" },
  { label: "Ajloun", value: "Ajloun" },
  { label: "Madaba", value: "Madaba" },
  { label: "Karak", value: "Karak" },
  { label: "Tafilah", value: "Tafilah" },
  { label: "Maan", value: "Maan" },
  { label: "Balqa", value: "Balqa" },
];

const ratingOptions = [
  { label: "All ratings", value: "all" },
  { label: "1+ stars", value: "1" },
  { label: "2+ stars", value: "2" },
  { label: "3+ stars", value: "3" },
  { label: "4+ stars", value: "4" },
  { label: "5 stars", value: "5" },
];

function TechniciansByService({ route, navigation }) {
  const { t } = useTranslation();
  const { c } = useTheme();
  const service = route?.params?.service || "";
  const [technicians, setTechnicians] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const load = async () => {
    try {
      setMessage("");
      const res = await API.get(`/technicians/service/${service}`);
      setTechnicians(Array.isArray(res.data) ? res.data : []);
    } catch {
      setTechnicians([]);
      setMessage(t("techByService.failedLoad"));
    }
  };

  useEffect(() => {
    load();
  }, [service]);

  const filtered = useMemo(() => {
    let result = [...technicians];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        [t.name, t.city, t.service, t.phone, t.email]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (cityFilter !== "all") {
      result = result.filter(
        (t) => String(t.city || "").toLowerCase() === cityFilter.toLowerCase()
      );
    }

    if (ratingFilter !== "all") {
      result = result.filter(
        (t) => Number(t.rating || 0) >= Number(ratingFilter)
      );
    }

    return result;
  }, [technicians, search, cityFilter, ratingFilter]);

  const clearFilters = () => {
    setSearch("");
    setCityFilter("all");
    setRatingFilter("all");
  };

  return (
    <SafeAreaView style={[appStyles.safe, { backgroundColor: c.bg }]}>
      <Header navigation={navigation} title={t("techByService.headerTitle")} />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <HeroSection
          title={`${service} ${t("techByService.technicians")}`}
          subtitle={t("techByService.subtitle")}
        />

        {message ? (
          <View style={appStyles.errorBox}>
            <Text style={appStyles.errorText}>{message}</Text>
          </View>
        ) : null}

        <View style={[styles.filterBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: c.inputBg, borderColor: c.border, color: c.text }]}
            value={search}
            onChangeText={setSearch}
            placeholder={t("techByService.searchPlaceholder")}
            placeholderTextColor={c.muted}
          />

          <View style={styles.filterRow}>
            <View style={styles.filterHalf}>
              <CustomDropdown
                label={t("techByService.city")}
                value={cityFilter}
                options={cityOptions}
                onChange={setCityFilter}
              />
            </View>

            <View style={styles.filterHalf}>
              <CustomDropdown
                label={t("techByService.rating")}
                value={ratingFilter}
                options={ratingOptions}
                onChange={setRatingFilter}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.clearSmallBtn} onPress={clearFilters}>
            <Text style={[styles.clearSmallText, { color: c.primary }]}>{t("techByService.clearFilters")}</Text>
          </TouchableOpacity>
        </View>

        {filtered.length === 0 ? (
          <View style={[appStyles.card, { backgroundColor: c.card }]}>
            <Text style={[appStyles.sectionTitle, { color: c.text }]}>{t("techByService.noTechnicians")}</Text>
          </View>
        ) : (
          filtered.map((tech) => (
            <View style={[appStyles.card, { backgroundColor: c.card }]} key={tech.id || tech.technicianId}>
              <View style={appStyles.between}>
                <Text style={[appStyles.sectionTitle, { color: c.text }]}>{tech.name || "-"}</Text>
                <View style={appStyles.statusBadge}>
                  <Text style={appStyles.statusText}>{tech.service || "-"}</Text>
                </View>
              </View>

              <Text style={[appStyles.text, { color: c.text }]}>
                {t("techByService.ratingLabel")} ⭐ {Number(tech.rating || 0).toFixed(1)}
              </Text>
              <Text style={[appStyles.text, { color: c.text }]}>{t("techByService.cityLabel")} {tech.city || "-"}</Text>
              <Text style={[appStyles.text, { color: c.text }]}>{t("techByService.phoneLabel")} {tech.phone || "-"}</Text>
              <Text style={[appStyles.text, { color: c.text }]}>
                {t("techByService.experienceLabel")} {tech.experience || 0} {t("techByService.years")}
              </Text>
              <Text style={[appStyles.text, { color: c.text }]}>
                {t("techByService.priceLabel")} {Number(tech.price_per_hour || 0).toFixed(2)} JOD/{t("techByService.hour")}
              </Text>

              <TouchableOpacity
                style={appStyles.primaryBtn}
                onPress={() =>
                  navigation.navigate("TechnicianProfile", {
                    technicianId: tech.technicianId || tech.id,
                  })
                }
              >
                <Text style={appStyles.primaryBtnText}>{t("techByService.viewProfile")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={appStyles.secondaryBtn}
                onPress={() =>
                  navigation.navigate("MaintenanceRequest", {
                    technicianId: tech.technicianId || tech.id,
                    technicianName: tech.name,
                    service: tech.service,
                    price_per_hour: tech.price_per_hour,
                  })
                }
              >
                <Text style={appStyles.secondaryBtnText}>{t("techByService.bookNow")}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 12,
    marginBottom: 16,
  },
  searchInput: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterHalf: {
    flex: 1,
  },
  clearSmallBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  clearSmallText: {
    color: colors.primary,
    fontWeight: "900",
  },
});

export default TechniciansByService;