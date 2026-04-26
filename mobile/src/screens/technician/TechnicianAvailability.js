import { useEffect, useState } from "react";
import API from "../../services/api";
import Header from "../../components/Common/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import appStyles from "../../styles/mobileStyles";

function TechnicianAvailability() {
  const [user, setUser] = useState(null);
  const [technicianId, setTechnicianId] = useState(null);
  const [technicianStatus, setTechnicianStatus] = useState("loading");
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    day: "",
    start_time: "",
    end_time: "",
  });

  const showMessage = (type, title, body) => {
    setMessage({ type, title, body });
    setTimeout(() => setMessage(null), 2800);
  };

  useEffect(() => {
    const loadUser = async () => {
      const raw = await AsyncStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    setTechnicianStatus("loading");

    API.get(`/technicians/user/${user.id}`)
      .then((res) => {
        setTechnicianId(res.data.technicianId);
        setTechnicianStatus("ready");
        setMessage(null);
      })
      .catch(() => {
        setTechnicianId(null);
        setTechnicianStatus("error");
      });
  }, [user?.id]);

  const submit = async () => {
    if (!form.day || !form.start_time || !form.end_time) {
      showMessage("warning", "Notice", "Please choose a date and time range.");
      return;
    }

    if (!technicianId && technicianStatus === "error") {
      showMessage("error", "Notice", "Technician profile not found. Please contact the admin.");
      return;
    }

    if (form.end_time <= form.start_time) {
      showMessage("error", "Notice", "End time must be later than start time.");
      return;
    }

    try {
      await API.post("/technicians/availability", {
        ...(technicianId ? { technician_id: technicianId } : {}),
        ...form,
      });

      showMessage("success", "Saved Successfully", "Save success. Review email.");

      setForm({
        day: "",
        start_time: "",
        end_time: "",
      });
    } catch (error) {
      showMessage(
        "error",
        "Notice",
        error.response?.data?.message || "Failed to save availability."
      );
    }
  };

  return (
    <SafeAreaView style={appStyles.screen}>
      <Header />

      <ScrollView style={appStyles.container} contentContainerStyle={appStyles.content}>
        <Text style={appStyles.title}>Set Availability</Text>

        {message ? (
          <View style={[appStyles.messageCard, appStyles[`${message.type}Card`]]}>
            <Text style={appStyles.messageTitle}>{message.title}</Text>
            <Text style={appStyles.messageBody}>{message.body}</Text>
          </View>
        ) : null}

        <View style={appStyles.panel}>
          <Text style={appStyles.label}>Date</Text>
          <TextInput
            style={appStyles.input}
            placeholder="YYYY-MM-DD"
            value={form.day}
            onChangeText={(text) => setForm({ ...form, day: text })}
          />

          <Text style={appStyles.label}>Start Time</Text>
          <TextInput
            style={appStyles.input}
            placeholder="HH:MM"
            value={form.start_time}
            onChangeText={(text) => setForm({ ...form, start_time: text })}
          />

          <Text style={appStyles.label}>End Time</Text>
          <TextInput
            style={appStyles.input}
            placeholder="HH:MM"
            value={form.end_time}
            onChangeText={(text) => setForm({ ...form, end_time: text })}
          />

          <TouchableOpacity style={appStyles.primaryBtn} onPress={submit}>
            <Text style={appStyles.primaryBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default TechnicianAvailability;
