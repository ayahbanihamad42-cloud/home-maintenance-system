import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

const homeLogo = require("../../assets/home.png");
const authBg = require("../../assets/home.png");

function Welcome({ navigation }) {
  const { t } = useTranslation();
  const { c } = useTheme();

  const bubbleOne = useRef(new Animated.Value(0)).current;
  const bubbleTwo = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateBubble = (value, delay = 0) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 2800,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 2800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateBubble(bubbleOne, 0);
    animateBubble(bubbleTwo, 900);
  }, [bubbleOne, bubbleTwo]);

  const bubbleOneMove = bubbleOne.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const bubbleTwoMove = bubbleTwo.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.primary }]}>
      <ImageBackground source={authBg} style={styles.bg} imageStyle={styles.bgImage}>
        <View style={styles.overlay}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.bubble,
              styles.bubbleOne,
              { transform: [{ translateY: bubbleOneMove }] },
            ]}
          />

          <Animated.View
            pointerEvents="none"
            style={[
              styles.bubble,
              styles.bubbleTwo,
              { transform: [{ translateY: bubbleTwoMove }] },
            ]}
          />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.brand, { color: c.primaryDark }]}>{t("brand")}</Text>

            <Text style={styles.title}>{t("welcome.tagline")}</Text>

            <Text style={styles.subtitle}>
              {t("welcome.description")}
            </Text>

            <View style={styles.logoCard}>
              <Image source={homeLogo} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.loginBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={[styles.loginText, { color: c.primaryDark }]}>{t("welcome.login")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={styles.registerText}>{t("welcome.register")}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  bg: {
    flex: 1,
  },

  bgImage: {
    opacity: 0.23,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(124, 58, 237, 0.84)",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 24,
  },

  brand: {
    fontSize: 44,
    fontWeight: "900",
    marginBottom: 24,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 44,
    fontWeight: "900",
    marginBottom: 16,
  },

  subtitle: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 26,
    fontWeight: "700",
  },

  logoCard: {
    width: 120,
    height: 110,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  logo: {
    width: 70,
    height: 70,
  },

  buttons: {
    marginTop: 40,
    gap: 14,
  },

  loginBtn: {
    height: 56,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  loginText: {
    fontSize: 18,
    fontWeight: "900",
  },

  registerBtn: {
    height: 56,
    borderRadius: 20,
    borderWidth: 1.4,
    borderColor: "rgba(255,255,255,0.86)",
    alignItems: "center",
    justifyContent: "center",
  },

  registerText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  bubble: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
  },

  bubbleOne: {
    width: 190,
    height: 190,
    right: -60,
    top: 80,
  },

  bubbleTwo: {
    width: 130,
    height: 130,
    left: -45,
    bottom: 190,
  },
});

export default Welcome;
