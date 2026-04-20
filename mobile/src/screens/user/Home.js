import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";

import plumbingImg from "../../images/plumbing.png";
import electricalImg from "../../images/electrical.png";
import paintingImg from "../../images/Painting.png";
import decorationImg from "../../images/Decoration.png";

import Header from "../../components/common/Header";

function Home() {
  const navigation = useNavigation();

  const services = [
    { name: "Plumbing", img: plumbingImg },
    { name: "Electrical", img: electricalImg },
    { name: "Painting", img: paintingImg },
    { name: "Decoration", img: decorationImg }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <Text style={styles.homeTitle}>Welcome to our services:</Text>

      <View style={styles.servicesContainer}>
        {services.map((s, i) => (
          <View key={i} style={styles.serviceItem}>
            
            <TouchableOpacity
              style={styles.serviceCircle}
              onPress={() => navigation.navigate("ServiceDetails", { serviceName: s.name })}
            >
              <Image
                source={s.img}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Text style={styles.serviceName}>{s.name}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  homeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 20,
    textAlign: "center",
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 10,
  },
  serviceItem: {
    alignItems: "center",
    marginBottom: 20,
    width: "45%",
  },
  serviceCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  serviceName: {
    fontSize: 14,
    color: "#333",
  },
});

export default Home;
