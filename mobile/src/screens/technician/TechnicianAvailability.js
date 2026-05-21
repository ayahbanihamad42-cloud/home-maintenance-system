import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import API from "../../services/api";

const days = [
  "All",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const formatDate = (date) => date.toISOString().split("T")[0];

const formatTime = (date) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}:00`;
};

export default function TechnicianAvailability({ navigation, route }) {
  const user = route?.params?.user || {};
  const userId = user?.id || user?.user_id;

  const [mode, setMode] = useState("one");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [date, setDate] = useState(new Date());
  const [monthStart, setMonthStart] = useState(new Date());
  const [monthEnd, setMonthEnd] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d;
  });

  const [dayOfWeek, setDayOfWeek] = useState("All");
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(20, 0, 0, 0);
    return d;
  });

  const [slotMinutes, setSlotMinutes] = useState("120");

  const [showDate, setShowDate] = useState(false);
  const [showMonthStart, setShowMonthStart] = useState(false);
  const [showMonthEnd, setShowMonthEnd] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const [myAvailability, setMyAvailability] = useState([]);
  const [regular, setRegular] = useState([]);

  const loadAvailability = async () => {
    try {
      const res = await API.get("/technicians/availability/my");
      setMyAvailability(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("availability load error:", err.response?.data || err.message);
    }
  };

  const loadRegular = async () => {
    try {
      const res = await API.get("/technicians/regular-availability/my");
      setRegular(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("regular load error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    loadAvailability();
    loadRegular();
  }, []);

  const validateTimes = () => {
    const s = startTime.getHours() * 60 + startTime.getMinutes();
    const e = endTime.getHours() * 60 + endTime.getMinutes();
    return e > s;
  };

  const save = async () => {
    try {
      setError("");
      setMessage("");

      if (!validateTimes()) {
        setError("End time must be after start time");
        return;
      }

      if (mode === "one") {
        await API.post("/technicians/availability", {
          available_date: formatDate(date),
          start_time: formatTime(startTime),
          end_time: formatTime(endTime),
        });
      } else {
        await API.post("/technicians/regular-availability", {
          month_start: formatDate(monthStart),
          month_end: formatDate(monthEnd),
          day_of_week: dayOfWeek,
          start_time: formatTime(startTime),
          end_time: formatTime(endTime),
          slot_minutes: Number(slotMinutes),
        });
      }

      setMessage("Availability saved successfully.");
      loadAvailability();
      loadRegular();
    } catch (err) {
      console.log("save availability error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to save availability.");
    }
  };

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.panel}>
          <Text style={styles.title}>Technician Availability</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {message ? <Text style={styles.success}>{message}</Text> : null}

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === "one" && styles.activeBtn]}
              onPress={() => setMode("one")}
            >
              <Text style={[styles.toggleText, mode === "one" && styles.activeText]}>
                One-Time
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, mode === "regular" && styles.activeBtn]}
              onPress={() => setMode("regular")}
            >
              <Text style={[styles.toggleText, mode === "regular" && styles.activeText]}>
                Regular Monthly
              </Text>
            </TouchableOpacity>
          </View>

          {mode === "one" ? (
            <>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowDate(true)}>
                <Text style={styles.inputText}>{formatDate(date)}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Month Start</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowMonthStart(true)}
              >
                <Text style={styles.inputText}>{formatDate(monthStart)}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Month End</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowMonthEnd(true)}
              >
                <Text style={styles.inputText}>{formatDate(monthEnd)}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Day Of Week</Text>
              <View style={styles.pickerBox}>
                <Picker selectedValue={dayOfWeek} onValueChange={setDayOfWeek}>
                  {days.map((d) => (
                    <Picker.Item key={d} label={d} value={d} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Each Request Duration</Text>
              <View style={styles.pickerBox}>
                <Picker selectedValue={slotMinutes} onValueChange={setSlotMinutes}>
                  <Picker.Item label="1 hour" value="60" />
                  <Picker.Item label="2 hours" value="120" />
                  <Picker.Item label="3 hours" value="180" />
                  <Picker.Item label="4 hours" value="240" />
                </Picker>
              </View>
            </>
          )}

          <Text style={styles.label}>Start Time</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowStart(true)}>
            <Text style={styles.inputText}>{formatTime(startTime)}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>End Time</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowEnd(true)}>
            <Text style={styles.inputText}>{formatTime(endTime)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveText}>Save Availability</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.subtitle}>
            {mode === "one" ? "One-Time Availability" : "Regular Monthly Schedule"}
          </Text>

          {(mode === "one" ? myAvailability : regular).length === 0 ? (
            <Text style={styles.empty}>No schedule added.</Text>
          ) : (
            (mode === "one" ? myAvailability : regular).map((item) => (
              <View key={item.id} style={styles.scheduleCard}>
                {mode === "one" ? (
                  <>
                    <Text style={styles.scheduleText}>
                      Date: {String(item.available_date || "").split("T")[0]}
                    </Text>
                    <Text style={styles.scheduleText}>
                      Time: {item.start_time} - {item.end_time}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.scheduleText}>
                      Month: {String(item.month_start || "").split("T")[0]} →{" "}
                      {String(item.month_end || "").split("T")[0]}
                    </Text>
                    <Text style={styles.scheduleText}>Day: {item.day_of_week}</Text>
                    <Text style={styles.scheduleText}>
                      Time: {item.start_time} - {item.end_time}
                    </Text>
                    <Text style={styles.scheduleText}>
                      Slot: {item.slot_minutes} minutes
                    </Text>
                  </>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, selected) => {
            setShowDate(false);
            if (selected) setDate(selected);
          }}
        />
      )}

      {showMonthStart && (
        <DateTimePicker
          value={monthStart}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, selected) => {
            setShowMonthStart(false);
            if (selected) setMonthStart(selected);
          }}
        />
      )}

      {showMonthEnd && (
        <DateTimePicker
          value={monthEnd}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, selected) => {
            setShowMonthEnd(false);
            if (selected) setMonthEnd(selected);
          }}
        />
      )}

      {showStart && (
        <DateTimePicker
          value={startTime}
          mode="time"
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, selected) => {
            setShowStart(false);
            if (selected) setStartTime(selected);
          }}
        />
      )}

      {showEnd && (
        <DateTimePicker
          value={endTime}
          mode="time"
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, selected) => {
            setShowEnd(false);
            if (selected) setEndTime(selected);
          }}
        />
      )}
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
  panel: {
    backgroundColor: "#fffaf4",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#d8c8b8",
  },
  title: { fontSize: 36, fontWeight: "900", marginBottom: 20 },
  error: {
    backgroundColor: "#fdebed",
    color: "#b4232b",
    padding: 14,
    borderRadius: 16,
    fontSize: 16,
    marginBottom: 14,
  },
  success: {
    backgroundColor: "#eaf7ec",
    color: "#176b2c",
    padding: 14,
    borderRadius: 16,
    fontSize: 16,
    marginBottom: 14,
  },
  toggleRow: { flexDirection: "row", gap: 12, marginBottom: 18 },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeBtn: { backgroundColor: "#111" },
  toggleText: { fontWeight: "900", fontSize: 15, color: "#111" },
  activeText: { color: "#fff" },
  label: { fontSize: 18, fontWeight: "900", marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: "#f7efe7",
    borderWidth: 1,
    borderColor: "#d8c8b8",
    borderRadius: 18,
    minHeight: 58,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  inputText: { fontSize: 18, color: "#111" },
  pickerBox: {
    backgroundColor: "#f7efe7",
    borderWidth: 1,
    borderColor: "#d8c8b8",
    borderRadius: 18,
    overflow: "hidden",
  },
  saveBtn: {
    backgroundColor: "#111",
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 24,
  },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  divider: { height: 1, backgroundColor: "#b9aa9b", marginVertical: 28 },
  subtitle: { fontSize: 26, fontWeight: "900", marginBottom: 16 },
  empty: { fontSize: 18, color: "#6b5e55" },
  scheduleCard: {
    backgroundColor: "#f7efe7",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  scheduleText: { fontSize: 16, marginBottom: 6 },
});