import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import API from "../../services/api";

const MaintenanceRequest = () => {
  const route = useRoute();
  const technicianId = route.params?.technicianId;

  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/technicians/${technicianId}/availability`);
        setDates(res.data || []);
      } catch (e) {
        console.log(e);
      }
    };

    if (technicianId) load();
  }, [technicianId]);

  const submit = async () => {
    if (!selectedDate || description.length < 10) {
      alert("Description must be at least 10 characters");
      return;
    }

    try {
      await API.post("/maintenance", {
        technicianId,
        date: selectedDate,
        description,
        paymentMethod: "ONLINE"
      });

      alert("Success ✅");
    } catch (err) {
      console.log(err.response?.data || err);
      alert("Error ❌");
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text>Maintenance Request</Text>

      {dates.map((d, i) => (
        <TouchableOpacity key={i} onPress={() => setSelectedDate(d.date)}>
          <Text>{d.date}</Text>
        </TouchableOpacity>
      ))}

      <TextInput
        placeholder="Enter description"
        value={description}
        onChangeText={setDescription}
        style={{ borderWidth: 1, marginTop: 20, padding: 10 }}
      />

      <TouchableOpacity onPress={submit} style={{ marginTop: 20 }}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default MaintenanceRequest;