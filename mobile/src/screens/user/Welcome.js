import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { ImageBackground ,} from "react-native";

export default function Welcome({ navigation }) {
  return (
<ImageBackground source={require("../../../assets/home.png")} style={styles.imageBackground}>
    <View style={styles.container}>
      
      <Text style={styles.title}>Home Maintenance</Text>
     
      <Text style={styles.subtitle}>
        Book trusted technicians easily and manage your home services.
      </Text>

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText} navigate="Login">
          Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

    </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    resizeMode: ""
    
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
        backgroundColor: "transparent"
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: "#040404"
  },

  buttonPrimary: {
    width: "100%",
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center"
  },

  buttonSecondary: {
    width: "100%",
    padding: 15,
    backgroundColor: "#28a745",
    borderRadius: 10,
    alignItems: "center"
  },

  buttonText: {
    color: "#090202",
    fontSize: 16,
    fontWeight: "bold"
  }
});