import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

function StoreCard({ store }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { c } = useTheme();

  if (!store) return null;

  return (
    <View style={[styles.card, { borderColor: c.border, backgroundColor: c.card }]}>
      <Text style={[styles.name, { color: c.text }]}>{store.name}</Text>
      <Text style={[styles.info, { color: c.muted }]}>{store.service}</Text>
      <Text style={[styles.info, { color: c.muted }]}>{store.city}</Text>
      <Text style={[styles.info, { color: c.muted }]}>{store.address}</Text>

      <Pressable
        onPress={() =>
          navigation.navigate("MaintenanceRequest", { storeId: store.storeId })
        }
        style={[styles.primaryBtn, { backgroundColor: c.primary }]}
      >
        <Text style={styles.primaryBtnText}>{t("cards.booking")}</Text>
      </Pressable>

      <Pressable style={[styles.secondaryBtn, styles.disabledBtn, { backgroundColor: c.primarySoft }]}>
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
  disabledBtn: {
    opacity: 0.6,
  },
});

export default StoreCard;
