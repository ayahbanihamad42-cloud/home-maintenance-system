import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

function TechnicianCard({ technician }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { c } = useTheme();

  return (
    <View style={{ padding: 15, margin: 10, borderWidth: 1, borderRadius: 10, borderColor: c.border, backgroundColor: c.card }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: c.text }}>
        {technician.name}
      </Text>

      <Text style={{ color: c.muted }}>{technician.service}</Text>
      <Text style={{ color: c.muted }}>{technician.experience} {t("cards.years")}</Text>

      <Pressable
        onPress={() =>
          navigation.navigate("MaintenanceRequest", {
            technicianId: technician.technicianId,
          })
        }
        style={{ marginTop: 10, backgroundColor: c.primary, padding: 10, borderRadius: 10 }}
      >
        <Text style={{ color: "#fff" }}>{t("cards.booking")}</Text>
      </Pressable>

      <Pressable
        onPress={() =>
          navigation.navigate("TechnicianProfile", {
            technicianId: technician.technicianId,
          })
        }
        style={{ marginTop: 10, backgroundColor: c.primarySoft, padding: 10, borderRadius: 10 }}
      >
        <Text style={{ color: c.text }}>{t("cards.viewProfile")}</Text>
      </Pressable>
    </View>
  );
}

export default TechnicianCard;
