import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

import welcomeimage from "../../images/home.png";

function Welcome() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.welcomeTitle}>
          Welcome to Home Maintenance System
        </Text>

        <Text style={styles.welcomeSubtitle}>
          Your trusted hub for home maintenance services.{"\n"}
          Book reliable technicians, manage requests, and keep your home in great shape.
        </Text>

        <Image 
          source={welcomeimage} 
          style={styles.welcomeImage} 
          resizeMode="contain" 
        />

        <View style={styles.welcomeButtons}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    alignItems: "center",
    padding: 20,
    justifyContent: "center",
    flexGrow: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 15,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
    marginBottom: 30,
  },
  welcomeImage: {
    width: "100%",
    height: 250,
    marginBottom: 40,
  },
  welcomeButtons: {
    width: "100%",
    gap: 15, // ملاحظة: تعمل في الإصدارات الحديثة من RN، إذا لم تعمل استخدم marginBottom في الـ button
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Welcome;

