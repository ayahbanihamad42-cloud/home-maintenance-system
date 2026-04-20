import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getUserRequests } from "../../services/maintenanceService";
import { getRatingByRequest } from "../../services/ratingService";

import MaintenanceCard from "../../components/cards/MaintenanceCard";
import Header from "../../components/common/Header";

function MaintenanceHistory() {
  const [requests, setRequests] = useState([]);
  const [ratingsByRequest, setRatingsByRequest] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) setUser(JSON.parse(userData));
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    getUserRequests()
      .then((data) => setRequests(data || []))
      .catch(() => setRequests([]));
  }, [user]);

  useEffect(() => {
    if (!requests.length) return;

    Promise.all(
      requests.map((request) =>
        getRatingByRequest(request.id)
          .then((rating) => ({
            requestId: request.id,
            rating
          }))
          .catch(() => ({
            requestId: request.id,
            rating: null
          }))
      )
    ).then((results) => {
      const nextRatings = {};
      results.forEach(({ requestId, rating }) => {
        nextRatings[requestId] = rating;
      });
      setRatingsByRequest(nextRatings);
    });
  }, [requests]);

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <View style={styles.content}>
        <Text style={styles.title}>Request History</Text>

        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MaintenanceCard
              request={item}
              rating={ratingsByRequest[item.id]}
            />
          )}
          contentContainerStyle={styles.listPadding}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#333",
  },
  listPadding: {
    paddingBottom: 20,
  },
});

export default MaintenanceHistory;
