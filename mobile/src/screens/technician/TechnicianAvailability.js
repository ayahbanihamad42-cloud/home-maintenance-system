import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const TechnicianAvailability = ({ navigation }) => {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ available_date: "", start_time: "", end_time: "" });
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const res = await API.get("/technicians/availability/my");
      setList(Array.isArray(res.data) ? res.data : []);
    } catch {
      setList([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      await API.post("/technicians/availability", form);
      setForm({ available_date: "", start_time: "", end_time: "" });
      setMessage("Availability saved successfully.");
      await load();
    } catch {
      setMessage("Failed to save availability.");
    }
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Availability" />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Availability</Text>
          <Text style={appStyles.heroSubtitle}>Add and manage your working times.</Text>
        </View>

        {message ? (
          <View style={message.includes("Failed") ? appStyles.errorBox : appStyles.successBox}>
            <Text style={message.includes("Failed") ? appStyles.errorText : appStyles.successText}>{message}</Text>
          </View>
        ) : null}

        <View style={appStyles.card}>
          <Text style={appStyles.label}>Date</Text>
          <TextInput style={appStyles.input} value={form.available_date} onChangeText={(v) => setForm({ ...form, available_date: v })} placeholder="YYYY-MM-DD" />

          <Text style={appStyles.label}>Start Time</Text>
          <TextInput style={appStyles.input} value={form.start_time} onChangeText={(v) => setForm({ ...form, start_time: v })} placeholder="HH:MM" />

          <Text style={appStyles.label}>End Time</Text>
          <TextInput style={appStyles.input} value={form.end_time} onChangeText={(v) => setForm({ ...form, end_time: v })} placeholder="HH:MM" />

          <TouchableOpacity style={appStyles.primaryBtn} onPress={save}>
            <Text style={appStyles.primaryBtnText}>Save Availability</Text>
          </TouchableOpacity>
        </View>

        <Text style={appStyles.sectionTitle}>Saved Availability</Text>

        {list.length === 0 ? (
          <View style={appStyles.card}>
            <Text style={appStyles.mutedText}>No availability yet.</Text>
          </View>
        ) : (
          list.map((item) => (
            <View style={appStyles.card} key={item.id}>
              <Text style={appStyles.text}>Date: {String(item.available_date || "").slice(0, 10)}</Text>
              <Text style={appStyles.text}>Time: {item.start_time} - {item.end_time}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
};

export default TechnicianAvailability;