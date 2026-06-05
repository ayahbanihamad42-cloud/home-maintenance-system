import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import appStyles, { colors } from "../../styles/mobileStyles";
import API from "../../services/api";

const days = ["All", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function TechnicianAvailability({ navigation }) {
  const [mode, setMode] = useState("one");
  const [oneTimeList, setOneTimeList] = useState([]);
  const [regularList, setRegularList] = useState([]);
  const [message, setMessage] = useState(null);
  const [showPicker, setShowPicker] = useState(null);

  const [oneForm, setOneForm] = useState({
    available_date: "",
    start_time: "08:00",
    end_time: "12:00",
  });

  const [regularForm, setRegularForm] = useState({
    day_of_week: "All",
    month_start: "",
    month_end: "",
    start_time: "08:00",
    end_time: "12:00",
    slot_minutes: "60",
  });

  const formatDateValue = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const normalizeDate = (value) => {
    if (!value) return "";
    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : String(value).slice(0, 10);
  };

  const normalizeTime = (value) => {
    if (!value) return "";
    const raw = String(value).trim();
    if (/^\d{2}:\d{2}$/.test(raw)) return `${raw}:00`;
    if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) return raw;
    return raw;
  };

  const shortTime = (value) => String(value || "").slice(0, 5);

  const validateTime = (start, end) => shortTime(start) < shortTime(end);

  const timeOverlaps = (s1, e1, s2, e2) => {
    const start1 = shortTime(s1);
    const end1 = shortTime(e1);
    const start2 = shortTime(s2);
    const end2 = shortTime(e2);
    return start1 < end2 && start2 < end1;
  };

  const load = async () => {
    try {
      setMessage(null);

      const oneRes = await API.get("/technicians/availability/my");
      const regularRes = await API.get("/technicians/regular-availability/my");

      const oneData = Array.isArray(oneRes.data)
        ? oneRes.data
        : Array.isArray(oneRes.data?.oneTime)
        ? oneRes.data.oneTime
        : [];

      const regularData = Array.isArray(regularRes.data)
        ? regularRes.data
        : Array.isArray(regularRes.data?.regular)
        ? regularRes.data.regular
        : [];

      setOneTimeList(oneData);
      setRegularList(regularData);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load availability.",
      });
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", load);
    load();
    return unsub;
  }, [navigation]);

  const existsInOneTime = (date, start, end) => {
    return oneTimeList.some(
      (x) =>
        normalizeDate(x.available_date) === date &&
        timeOverlaps(start, end, x.start_time, x.end_time)
    );
  };

  const existsInRegular = (date, dayName, start, end) => {
    const dateObj = new Date(date);
    const dateDay = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    return regularList.some((x) => {
      const from = normalizeDate(x.month_start);
      const to = normalizeDate(x.month_end);
      const day = x.day_of_week || "All";

      const dayMatches = day === "All" || day === dayName || day === dateDay;
      const dateInside = date >= from && date <= to;

      return dayMatches && dateInside && timeOverlaps(start, end, x.start_time, x.end_time);
    });
  };

  const addOneTime = async () => {
    try {
      setMessage(null);

      if (!oneForm.available_date || !oneForm.start_time || !oneForm.end_time) {
        setMessage({ type: "error", text: "Please fill date, start time, and end time." });
        return;
      }

      if (!validateTime(oneForm.start_time, oneForm.end_time)) {
        setMessage({ type: "error", text: "Start time must be before end time." });
        return;
      }

      if (existsInOneTime(oneForm.available_date, oneForm.start_time, oneForm.end_time)) {
        setMessage({ type: "error", text: "This one-time availability already overlaps with an existing one." });
        return;
      }

      if (existsInRegular(oneForm.available_date, "All", oneForm.start_time, oneForm.end_time)) {
        setMessage({ type: "error", text: "This time already overlaps with a regular availability." });
        return;
      }

      await API.post("/technicians/availability", {
        available_date: oneForm.available_date,
        start_time: normalizeTime(oneForm.start_time),
        end_time: normalizeTime(oneForm.end_time),
      });

      setOneForm({ available_date: "", start_time: "08:00", end_time: "12:00" });
      setMessage({ type: "success", text: "Availability added successfully." });
      await load();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to add availability." });
    }
  };

  const addRegular = async () => {
    try {
      setMessage(null);

      if (!regularForm.month_start || !regularForm.month_end || !regularForm.start_time || !regularForm.end_time) {
        setMessage({ type: "error", text: "Please fill all regular availability fields." });
        return;
      }

      if (regularForm.month_start > regularForm.month_end) {
        setMessage({ type: "error", text: "Month start must be before month end." });
        return;
      }

      if (!validateTime(regularForm.start_time, regularForm.end_time)) {
        setMessage({ type: "error", text: "Start time must be before end time." });
        return;
      }

      const duplicateRegular = regularList.some((x) => {
        const sameDay = (x.day_of_week || "All") === regularForm.day_of_week;
        const rangeOverlaps =
          regularForm.month_start <= normalizeDate(x.month_end) &&
          normalizeDate(x.month_start) <= regularForm.month_end;

        return sameDay && rangeOverlaps && timeOverlaps(
          regularForm.start_time,
          regularForm.end_time,
          x.start_time,
          x.end_time
        );
      });

      if (duplicateRegular) {
        setMessage({ type: "error", text: "This regular availability overlaps with an existing regular availability." });
        return;
      }

      const overlapsOneTime = oneTimeList.some((x) => {
        const d = normalizeDate(x.available_date);
        if (d < regularForm.month_start || d > regularForm.month_end) return false;

        const day = new Date(d).toLocaleDateString("en-US", { weekday: "long" });
        const dayMatches = regularForm.day_of_week === "All" || regularForm.day_of_week === day;

        return dayMatches && timeOverlaps(regularForm.start_time, regularForm.end_time, x.start_time, x.end_time);
      });

      if (overlapsOneTime) {
        setMessage({ type: "error", text: "This regular availability overlaps with an existing one-time availability." });
        return;
      }

      await API.post("/technicians/regular-availability", {
        day_of_week: regularForm.day_of_week,
        month_start: regularForm.month_start,
        month_end: regularForm.month_end,
        start_time: normalizeTime(regularForm.start_time),
        end_time: normalizeTime(regularForm.end_time),
        slot_minutes: Number(regularForm.slot_minutes || 60),
      });

      setRegularForm({
        day_of_week: "All",
        month_start: "",
        month_end: "",
        start_time: "08:00",
        end_time: "12:00",
        slot_minutes: "60",
      });

      setMessage({ type: "success", text: "Regular availability added successfully." });
      await load();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to add regular availability." });
    }
  };

  const deleteAvailability = (id, type) => {
    Alert.alert("Delete", "Delete this availability?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (type === "regular") {
              await API.delete(`/technicians/regular-availability/${id}`);
            } else {
              await API.delete(`/technicians/availability/${id}`);
            }
            await load();
          } catch {
            setMessage({ type: "error", text: "Failed to delete availability." });
          }
        },
      },
    ]);
  };

  const onPickDate = (event, selectedDate) => {
    if (Platform.OS !== "ios") setShowPicker(null);
    if (!selectedDate) return;

    const value = formatDateValue(selectedDate);

    if (showPicker === "one_date") setOneForm((p) => ({ ...p, available_date: value }));
    if (showPicker === "regular_start") setRegularForm((p) => ({ ...p, month_start: value }));
    if (showPicker === "regular_end") setRegularForm((p) => ({ ...p, month_end: value }));
  };

  const visibleOneTime = useMemo(
    () => [...oneTimeList].sort((a, b) => `${normalizeDate(a.available_date)} ${a.start_time}`.localeCompare(`${normalizeDate(b.available_date)} ${b.start_time}`)),
    [oneTimeList]
  );

  const visibleRegular = useMemo(
    () => [...regularList].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)),
    [regularList]
  );

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Availability" />

      <ScrollView contentContainerStyle={appStyles.pageContent} showsVerticalScrollIndicator={false}>
        <HeroSection title="Availability" subtitle="Add one-time or regular working times." />

        {message ? (
          <View style={message.type === "success" ? appStyles.successBox : appStyles.errorBox}>
            <Text style={message.type === "success" ? appStyles.successText : appStyles.errorText}>{message.text}</Text>
          </View>
        ) : null}

        <View style={appStyles.row}>
          <TouchableOpacity
            style={[appStyles.secondaryBtn, { flex: 1, backgroundColor: mode === "one" ? colors.primary : "#fff" }]}
            onPress={() => setMode("one")}
          >
            <Text style={{ color: mode === "one" ? "#fff" : colors.primary, fontWeight: "900", textAlign: "center" }}>One Time</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[appStyles.secondaryBtn, { flex: 1, backgroundColor: mode === "regular" ? colors.primary : "#fff" }]}
            onPress={() => setMode("regular")}
          >
            <Text style={{ color: mode === "regular" ? "#fff" : colors.primary, fontWeight: "900", textAlign: "center" }}>Regular</Text>
          </TouchableOpacity>
        </View>

        {mode === "one" ? (
          <View style={appStyles.card}>
            <Text style={appStyles.sectionTitle}>Add One Time Availability</Text>

            <Text style={appStyles.label}>Date</Text>
            <TouchableOpacity style={appStyles.input} onPress={() => setShowPicker("one_date")}>
              <Text style={appStyles.text}>{oneForm.available_date || "Choose date"}</Text>
            </TouchableOpacity>

            <Text style={appStyles.label}>Start Time</Text>
            <TextInput style={appStyles.input} value={oneForm.start_time} onChangeText={(v) => setOneForm((p) => ({ ...p, start_time: v }))} placeholder="08:00" />

            <Text style={appStyles.label}>End Time</Text>
            <TextInput style={appStyles.input} value={oneForm.end_time} onChangeText={(v) => setOneForm((p) => ({ ...p, end_time: v }))} placeholder="12:00" />

            <TouchableOpacity style={appStyles.primaryBtn} onPress={addOneTime}>
              <Text style={appStyles.primaryBtnText}>Add Availability</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={appStyles.card}>
            <Text style={appStyles.sectionTitle}>Add Regular Availability</Text>

            <Text style={appStyles.label}>Day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {days.map((day) => {
                const active = regularForm.day_of_week === day;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[appStyles.secondaryBtn, { marginRight: 8, paddingHorizontal: 18, backgroundColor: active ? colors.primary : colors.primarySoft }]}
                    onPress={() => setRegularForm((p) => ({ ...p, day_of_week: day }))}
                  >
                    <Text style={{ color: active ? "#fff" : colors.primary, fontWeight: "900" }}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={appStyles.label}>Month Start</Text>
            <TouchableOpacity style={appStyles.input} onPress={() => setShowPicker("regular_start")}>
              <Text style={appStyles.text}>{regularForm.month_start || "Choose start date"}</Text>
            </TouchableOpacity>

            <Text style={appStyles.label}>Month End</Text>
            <TouchableOpacity style={appStyles.input} onPress={() => setShowPicker("regular_end")}>
              <Text style={appStyles.text}>{regularForm.month_end || "Choose end date"}</Text>
            </TouchableOpacity>

            <Text style={appStyles.label}>Start Time</Text>
            <TextInput style={appStyles.input} value={regularForm.start_time} onChangeText={(v) => setRegularForm((p) => ({ ...p, start_time: v }))} placeholder="08:00" />

            <Text style={appStyles.label}>End Time</Text>
            <TextInput style={appStyles.input} value={regularForm.end_time} onChangeText={(v) => setRegularForm((p) => ({ ...p, end_time: v }))} placeholder="12:00" />

            <TouchableOpacity style={appStyles.primaryBtn} onPress={addRegular}>
              <Text style={appStyles.primaryBtnText}>Add Regular Availability</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={appStyles.sectionTitle}>{mode === "one" ? "One Time Availability" : "Regular Availability"}</Text>

        {mode === "one" ? (
          visibleOneTime.length === 0 ? (
            <View style={appStyles.card}><Text style={appStyles.mutedText}>No one-time availability.</Text></View>
          ) : (
            visibleOneTime.map((item) => (
              <View style={appStyles.card} key={item.id}>
                <Text style={appStyles.sectionTitle}>{normalizeDate(item.available_date)}</Text>
                <Text style={appStyles.text}>Time: {item.start_time} - {item.end_time}</Text>
                <TouchableOpacity style={appStyles.secondaryBtn} onPress={() => deleteAvailability(item.id, "one")}>
                  <Text style={appStyles.secondaryBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        ) : visibleRegular.length === 0 ? (
          <View style={appStyles.card}><Text style={appStyles.mutedText}>No regular availability.</Text></View>
        ) : (
          visibleRegular.map((item) => (
            <View style={appStyles.card} key={item.id}>
              <Text style={appStyles.sectionTitle}>{item.day_of_week || "Regular"}</Text>
              <Text style={appStyles.text}>From: {normalizeDate(item.month_start)}</Text>
              <Text style={appStyles.text}>To: {normalizeDate(item.month_end)}</Text>
              <Text style={appStyles.text}>Time: {item.start_time} - {item.end_time}</Text>
              <TouchableOpacity style={appStyles.secondaryBtn} onPress={() => deleteAvailability(item.id, "regular")}>
                <Text style={appStyles.secondaryBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {showPicker ? <DateTimePicker value={new Date()} mode="date" display="default" onChange={onPickDate} /> : null}

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default TechnicianAvailability;