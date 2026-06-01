import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import appStyles from "../../styles/mobileStyles";

const AppCard = ({
  title,
  status,
  description,
  buttonText = "View Details",
  onPress,
  children,
}) => {
  return (
    <View style={appStyles.card}>
      <View style={appStyles.between}>
        <Text style={appStyles.sectionTitle}>{title}</Text>

        {status ? (
          <View style={appStyles.statusBadge}>
            <Text style={appStyles.statusText}>{status}</Text>
          </View>
        ) : null}
      </View>

      {description ? (
        <Text style={appStyles.mutedText}>{description}</Text>
      ) : null}

      {children}

      {onPress ? (
        <TouchableOpacity style={appStyles.primaryBtn} onPress={onPress}>
          <Text style={appStyles.primaryBtnText}>{buttonText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default AppCard;