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
} from "react-native";
import { colors } from "../../styles/mobileStyles";

const homeLogo = require("../../assets/home.png");

function Welcome({ navigation }) {
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
    <SafeAreaView style={styles.safe}>
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

          <View style={styles.content}>
            <Text style={styles.brand}>خدمة</Text>

            <Text style={styles.title}>Home services made simple.</Text>

            <Text style={styles.subtitle}>
              Book trusted technicians, manage requests, chat instantly, use AI
              assistance, and track your maintenance service from one modern platform.
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
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={styles.registerText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#7C3AED",
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

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 34,
  },

  brand: {
    color: "#120D22",
    fontSize: 50,
    fontWeight: "900",
    marginBottom: 48,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 42,
    lineHeight: 52,
    fontWeight: "900",
    marginBottom: 28,
  },

  subtitle: {
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 34,
    fontWeight: "800",
  },

  logoCard: {
    width: 166,
    height: 150,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 48,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  logo: {
    width: 110,
    height: 110,
  },

  buttons: {
    marginTop: "auto",
    gap: 18,
  },

  loginBtn: {
    height: 66,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  loginText: {
    color: colors.primaryDark || "#5B21B6",
    fontSize: 19,
    fontWeight: "900",
  },

  registerBtn: {
    height: 66,
    borderRadius: 24,
    borderWidth: 1.4,
    borderColor: "rgba(255,255,255,0.86)",
    alignItems: "center",
    justifyContent: "center",
  },

  registerText: {
    color: "#FFFFFF",
    fontSize: 19,
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