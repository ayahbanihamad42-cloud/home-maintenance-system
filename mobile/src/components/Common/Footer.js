import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

function Footer() {
  const { t } = useTranslation();
  const { c } = useTheme();

  return (
    <View style={{ padding: 10, alignItems: "center", backgroundColor: c.bg }}>
      <Text style={{ color: c.muted }}>{t("footer.copyright")}</Text>
    </View>
  );
}

export default Footer;