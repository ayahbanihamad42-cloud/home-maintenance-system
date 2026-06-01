import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const imgUrl = (v) => {
  if (!v) return "";
  if (String(v).startsWith("http")) return v;
  return `http://localhost:5000${v}`;
};

const TechnicianProfile = ({ route, navigation }) => {
  const technicianId = route?.params?.technicianId;
  const [tech, setTech] = useState(null);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/technicians/${technicianId}`);
        setTech(res.data);
      } catch {
        setTech(null);
      }

      try {
        const g = await API.get(`/technicians/${technicianId}/gallery`);
        setGallery(Array.isArray(g.data) ? g.data : []);
      } catch {
        setGallery([]);
      }
    };
    load();
  }, [technicianId]);

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Technician Profile" />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>{tech?.name || "Technician"}</Text>
          <Text style={appStyles.heroSubtitle}>{tech?.service || ""}</Text>
        </View>

        <View style={appStyles.card}>
          <Text style={appStyles.text}>City: {tech?.city || "-"}</Text>
          <Text style={appStyles.text}>Phone: {tech?.phone || "-"}</Text>
          <Text style={appStyles.text}>Experience: {tech?.experience || 0} years</Text>
          <Text style={appStyles.text}>Rating: ⭐ {Number(tech?.rating || tech?.avg_rating || 0).toFixed(1)}</Text>

          <TouchableOpacity
            style={appStyles.primaryBtn}
            onPress={() =>
              navigation.navigate("MaintenanceRequest", {
                technician: tech,
                technicianId,
                service: tech?.service,
              })
            }
          >
            <Text style={appStyles.primaryBtnText}>Booking</Text>
          </TouchableOpacity>
        </View>

        <Text style={appStyles.sectionTitle}>Work Gallery</Text>

        {gallery.length === 0 ? (
          <View style={appStyles.card}>
            <Text style={appStyles.mutedText}>No gallery posts yet.</Text>
          </View>
        ) : (
          gallery.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={appStyles.card}
              onPress={() => navigation.navigate("PostDetails", { postId: post.id, posts: gallery })}
            >
              {post.image_url ? (
                <Image source={{ uri: imgUrl(post.image_url) }} style={{ width: "100%", height: 190, borderRadius: 20 }} />
              ) : null}
              <Text style={[appStyles.text, { marginTop: 10 }]}>{post.description || "-"}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
};

export default TechnicianProfile;