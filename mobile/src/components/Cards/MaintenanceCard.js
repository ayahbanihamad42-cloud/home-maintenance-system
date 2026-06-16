import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

function TechnicianCard({ technician }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { c } = useTheme();

  if (!technician) return null;

  return (
    <View style={[styles.card, { borderColor: c.border, backgroundColor: c.card }]}>
      <Text style={[styles.name, { color: c.text }]}>{technician.name}</Text>
      <Text style={[styles.info, { color: c.muted }]}>{technician.service}</Text>
      <Text style={[styles.info, { color: c.muted }]}>{technician.experience} {t("cards.years")}</Text>

      <Pressable
        onPress={() =>
          navigation.navigate("MaintenanceRequest", {
            technicianId: technician.technicianId,
          })
        }
        style={[styles.primaryBtn, { backgroundColor: c.primary }]}
      >
        <Text style={styles.primaryBtnText}>{t("cards.booking")}</Text>
      </Pressable>

      <Pressable
        onPress={() =>
          navigation.navigate("TechnicianProfile", {
            technicianId: technician.technicianId,
          })
        }
        style={[styles.secondaryBtn, { backgroundColor: c.primarySoft }]}
      >
        <Text style={[styles.secondaryBtnText, { color: c.text }]}>{t("cards.viewProfile")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
  },
  primaryBtn: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryBtn: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontWeight: "700",
  },
});

export default TechnicianCard;
