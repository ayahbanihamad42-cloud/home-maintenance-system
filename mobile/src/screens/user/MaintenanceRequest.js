import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import API from "../../services/api";

export default function MaintenanceRequest({ navigation, route }) {
  const params = route?.params || {};
  const technician = params.technician || {};

  const technicianId =
    params.technicianId || technician.technicianId || technician.id;

  const [user, setUser] = useState(params.user || {});
  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [form, setForm] = useState({
    service: params.service || technician.service || "",
    technicianName: params.technicianName || technician.name || "",
    scheduled_date: "",
    scheduled_time: "",
    estimated_hours: "1",
    payment_method: "cash",
    location_note: "",
    description: "",
    price_per_hour: String(params.price_per_hour || technician.price_per_hour || 0),
  });

  const [error, setError] = useState("");

  const total = useMemo(() => {
    return (
      Number(form.price_per_hour || 0) * Number(form.estimated_hours || 1)
    ).toFixed(2);
  }, [form.price_per_hour, form.estimated_hours]);

  const loadDates = async () => {
    if (!technicianId) {
      setError("Technician id is missing.");
      return;
    }

    try {
      setLoadingAvailability(true);
      const res = await API.get(`/technicians/${technicianId}/availability`);
      const list = Array.isArray(res.data) ? res.data : [];

      const uniqueDates = [
        ...new Set(
          list
            .filter((x) => !x.is_booked)
            .map((x) => String(x.available_date || "").split("T")[0])
            .filter(Boolean)
        ),
      ];

      setDates(uniqueDates);

      if (uniqueDates.length > 0) {
        setForm((prev) => ({ ...prev, scheduled_date: uniqueDates[0] }));
      }
    } catch (err) {
      console.log("load dates error:", err.response?.data || err.message);
      setDates([]);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const loadTimes = async () => {
    if (!technicianId || !form.scheduled_date) return;

    try {
      const res = await API.get(`/technicians/${technicianId}/availability`, {
        params: { date: form.scheduled_date },
      });

      const list = Array.isArray(res.data) ? res.data : [];

      const slots = list
        .filter((x) => !x.is_booked)
        .map((x) => ({
          id: x.id,
          label: `${x.start_time} - ${x.end_time}`,
          value: x.start_time,
        }));

      setTimes(slots);

      if (slots.length > 0) {
        setForm((prev) => ({ ...prev, scheduled_time: slots[0].value }));
      } else {
        setForm((prev) => ({ ...prev, scheduled_time: "" }));
      }
    } catch (err) {
      console.log("load times error:", err.response?.data || err.message);
      setTimes([]);
    }
  };

  useEffect(() => {
    loadDates();
  }, [technicianId]);

  useEffect(() => {
    loadTimes();
  }, [form.scheduled_date]);

  const submit = async () => {
    try {
      setError("");

      if (!technicianId) {
        setError("Technician id is missing.");
        return;
      }

      if (!form.scheduled_date || !form.scheduled_time) {
        setError("Please choose available date and time.");
        return;
      }

      if (!form.description.trim()) {
        setError("Please enter description.");
        return;
      }

      const payload = {
        user_id: user?.id,
        technician_id: technicianId,
        service: form.service,
        service_type: form.service,
        description: form.description,
        city: user?.city || "",
        location: form.location_note,
        location_note: form.location_note,
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        estimated_hours: Number(form.estimated_hours || 1),
        payment_method: String(form.payment_method).toLowerCase(),
        price_per_hour: Number(form.price_per_hour || 0),
        total_price: Number(total),
      };

      const res = await API.post("/maintenance", payload);
      const requestId = res.data?.requestId || res.data?.id;

      if (form.payment_method === "online") {
        navigation.navigate("PaymentForm", {
          requestId,
          amount: Number(total),
          technicianId,
          estimated_hours: Number(form.estimated_hours || 1),
        });
      } else {
        navigation.navigate("MaintenanceHistory");
      }
    } catch (err) {
      console.log("submit request error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to submit request.");
    }
  };

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.panel}>
          <Text style={styles.title}>Maintenance Request</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.grid}>
            <View style={styles.field}>
              <Text style={styles.label}>Service</Text>
              <TextInput style={styles.input} value={form.service} editable={false} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Technician</Text>
              <TextInput
                style={styles.input}
                value={form.technicianName}
                editable={false}
              />
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.field}>
              <Text style={styles.label}>Date</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={form.scheduled_date}
                  onValueChange={(value) =>
                    setForm({ ...form, scheduled_date: value })
                  }
                >
                  <Picker.Item label="Select date" value="" />
                  {dates.map((date) => (
                    <Picker.Item key={date} label={date} value={date} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Time Slot</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={form.scheduled_time}
                  onValueChange={(value) =>
                    setForm({ ...form, scheduled_time: value })
                  }
                >
                  <Picker.Item label="Select time" value="" />
                  {times.map((time) => (
                    <Picker.Item
                      key={time.id || time.label}
                      label={time.label}
                      value={time.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.field}>
              <Text style={styles.label}>Estimated Hours</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={form.estimated_hours}
                onChangeText={(v) => setForm({ ...form, estimated_hours: v })}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={form.payment_method}
                  onValueChange={(value) =>
                    setForm({ ...form, payment_method: value })
                  }
                >
                  <Picker.Item label="Cash" value="cash" />
                  <Picker.Item label="Online" value="online" />
                </Picker>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Price Summary</Text>
          <TextInput
            style={styles.input}
            editable={false}
            value={`Price / hour: ${Number(form.price_per_hour || 0).toFixed(
              2
            )} JOD | Estimated Hours: ${
              form.estimated_hours
            } | Total: ${total} JOD`}
          />

          <Text style={styles.label}>Location Note</Text>
          <TextInput
            style={styles.input}
            value={form.location_note}
            onChangeText={(v) => setForm({ ...form, location_note: v })}
            placeholder="Example: Irbid, near Yarmouk University"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={form.description}
            onChangeText={(v) => setForm({ ...form, description: v })}
            placeholder="Describe the problem..."
          />

          <TouchableOpacity style={styles.btn} onPress={submit}>
            <Text style={styles.btnText}>
              {form.payment_method === "online"
                ? "Continue to Payment"
                : "Submit Request"}
            </Text>
          </TouchableOpacity>

          {loadingAvailability ? (
            <ActivityIndicator color="#111" style={{ marginTop: 20 }} />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function Header({ navigation }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Maintenance System</Text>
      <TouchableOpacity style={styles.bell}>
        <Text style={styles.bellText}>🔔</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e7dccc" },
  header: {
    minHeight: 96,
    backgroundColor: "#faf5ef",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#d8c8b8",
  },
  headerTitle: { flex: 1, fontSize: 26, fontWeight: "900" },
  bell: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bellText: { fontSize: 26 },
  logout: {
    backgroundColor: "#111",
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 28,
  },
  logoutText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  container: { padding: 24, paddingBottom: 70 },
  backBtn: {
    backgroundColor: "#111",
    alignSelf: "flex-start",
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 28,
    marginBottom: 24,
  },
  backText: { color: "#fff", fontSize: 20, fontWeight: "900" },
  panel: {
    backgroundColor: "#fffaf4",
    borderRadius: 28,
    padding: 26,
    borderWidth: 1,
    borderColor: "#d8c8b8",
  },
  title: { fontSize: 38, fontWeight: "900", marginBottom: 20 },
  error: {
    backgroundColor: "#fdebed",
    color: "#b4232b",
    padding: 14,
    borderRadius: 14,
    fontSize: 17,
    marginBottom: 16,
  },
  grid: { flexDirection: "row", gap: 12 },
  field: { flex: 1 },
  label: { fontSize: 17, fontWeight: "900", marginBottom: 8, marginTop: 14 },
  input: {
    backgroundColor: "#f7efe7",
    borderWidth: 1,
    borderColor: "#d8c8b8",
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 56,
    fontSize: 17,
  },
  pickerBox: {
    backgroundColor: "#f7efe7",
    borderWidth: 1,
    borderColor: "#d8c8b8",
    borderRadius: 16,
    overflow: "hidden",
  },
  textArea: { height: 120, textAlignVertical: "top", paddingTop: 14 },
  btn: {
    backgroundColor: "#111",
    alignSelf: "flex-start",
    marginTop: 18,
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 20,
  },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "900" },
});