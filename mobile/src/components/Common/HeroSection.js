import React from "react";
import { ImageBackground, View, Text, StyleSheet } from "react-native";
import { colors } from "../../styles/mobileStyles";

const heroImage = {
  uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
};

function HeroSection({ title, subtitle }) {
  return (
    <ImageBackground
      source={heroImage}
      style={styles.hero}
      imageStyle={styles.heroImage}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    borderRadius: 34,
    overflow: "hidden",
    marginBottom: 28,
    backgroundColor: colors.primary,
  },

  heroImage: {
    borderRadius: 34,
  },

  overlay: {
    minHeight: 190,
    padding: 28,
    justifyContent: "center",
    backgroundColor: "rgba(124, 58, 237, 0.78)",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "900",
  },

  subtitle: {
    color: "#FFFFFF",
    marginTop: 14,
    fontSize: 17,
    lineHeight: 28,
    fontWeight: "700",
  },
});

export default HeroSection;