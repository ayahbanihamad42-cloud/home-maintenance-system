import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import API from "../../services/api";
import Header from "../../components/Common/Header";
import { getTechnicianGallery } from "../../services/technicianService";

function TechnicianProfile() {
  const route = useRoute();
  const navigation = useNavigation();

  const { technicianId } = route.params || {};

  const [tech, setTech] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!technicianId) return;

    API.get(`/technicians/${technicianId}`)
      .then((res) => setTech(res.data))
      .catch((err) => console.error(err));
  }, [technicianId]);

  useEffect(() => {
    if (!technicianId) return;

    getTechnicianGallery(technicianId)
      .then((data) => setPosts(data || []))
      .catch(() => setPosts([]));
  }, [technicianId]);

  if (!tech) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }

  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.name}>{tech.name}</Text>

          <Text style={styles.specialty}>{tech.service} Specialist</Text>

          <View style={styles.stats}>
            <Text style={styles.statItem}>
              <Text style={styles.bold}>Experience: </Text>
              {tech.experience} Years
            </Text>

            <Text style={styles.statItem}>
              <Text style={styles.bold}>Rating: </Text>
              ⭐ {Number(tech.rating || 0).toFixed(1)}
            </Text>

            <Text style={styles.statItem}>
              <Text style={styles.bold}>Price / hour: </Text>
              {Number(tech.price_per_hour || 0).toFixed(2)} JOD
            </Text>
          </View>

          <View style={styles.contact}>
            <Text>
              <Text style={styles.bold}>City: </Text>
              {tech.city || "Not provided"}
            </Text>

            <Text>
              <Text style={styles.bold}>Phone: </Text>
              {tech.phone || "Not provided"}
            </Text>

            <Text>
              <Text style={styles.bold}>Email: </Text>
              {tech.email || "Not provided"}
            </Text>
          </View>

          <Text style={styles.bio}>
            {tech.bio || "Experienced technician ready to help."}
          </Text>

          <View style={styles.actions}>
            <Button
              title="Send Message"
              onPress={() => navigation.navigate("Chat", { userId: tech.user_id })}
              color="#111"
            />
          </View>
        </View>

        <View style={styles.galleryWrapper}>
          <View style={styles.divider} />

          <Text style={styles.galleryTitle}>Work Gallery</Text>

          {posts.length === 0 ? (
            <Text style={styles.empty}>No work posts yet.</Text>
          ) : (
            <View style={styles.grid}>
              {posts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.post}
                  onPress={() =>
                    navigation.navigate("GalleryPostDetails", { post })
                  }
                >
                  <Image
                    source={{ uri: post.images?.[0] }}
                    style={styles.postImage}
                  />

                  <Text style={styles.caption} numberOfLines={2}>
                    {post.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#E8DCCF",
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFF9F3",
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 5,
    color: "#111",
  },
  specialty: {
    fontSize: 16,
    color: "#3A3028",
    marginBottom: 15,
    fontWeight: "700",
  },
  stats: {
    marginBottom: 15,
  },
  statItem: {
    fontSize: 14,
    marginBottom: 5,
    color: "#111",
  },
  bold: {
    fontWeight: "800",
  },
  contact: {
    marginBottom: 15,
    gap: 6,
  },
  bio: {
    fontSize: 14,
    marginBottom: 15,
    color: "#3A3028",
    lineHeight: 21,
  },
  actions: {
    alignItems: "flex-start",
  },
  galleryWrapper: {
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    padding: 15,
    marginBottom: 30,
  },
  divider: {
    height: 1,
    backgroundColor: "#D8C8B8",
    marginBottom: 18,
  },
  galleryTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111",
    marginBottom: 14,
  },
  empty: {
    color: "#3A3028",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  post: {
    width: "48%",
    backgroundColor: "#FFF9F3",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  postImage: {
    width: "100%",
    height: 170,
  },
  caption: {
    padding: 10,
    color: "#2C251F",
    lineHeight: 19,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TechnicianProfile;