import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import API from "../../services/api";
import appStyles, { colors } from "../../styles/mobileStyles";

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

function TechnicianAvailability({ navigation }) {
  const [availability, setAvailability] = useState([]);
  const [regularAvailability, setRegularAvailability] = useState([]);
  const [message, setMessage] = useState(null);

  const [oneTimeForm, setOneTimeForm] = useState({
    available_date: "",
    start_time: "",
    end_time: "",
  });

  const [regularForm, setRegularForm] = useState({
    day_of_week: "All",
    month_start: "",
    month_end: "",
    start_time: "",
    end_time: "",
    slot_minutes: "60",
  });

  const formatDate = (value) => {
    if (!value) return "-";
    const raw = String(value);
    const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : raw.slice(0, 10);
  };

  const formatTime = (value) => {
    if (!value) return "-";
    return String(value).slice(0, 8);
  };

  const load = async () => {
    try {
      setMessage(null);

      const res = await API.get("/technicians/availability/my");

      const data = res.data || {};

      if (Array.isArray(data)) {
        setAvailability(data);
        setRegularAvailability([]);
      } else {
        setAvailability(Array.isArray(data.oneTime) ? data.oneTime : []);
        setRegularAvailability(
          Array.isArray(data.regular) ? data.regular : []
        );
      }
    } catch (err) {
      setAvailability([]);
      setRegularAvailability([]);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load availability.",
      });
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", load);
    load();

    return unsubscribe;
  }, [navigation]);

  const validateTime = (start, end) => {
    if (!start || !end) return false;
    return String(start).slice(0, 5) < String(end).slice(0, 5);
  };

  const addOneTimeAvailability = async () => {
    try {
      setMessage(null);

      if (
        !oneTimeForm.available_date ||
        !oneTimeForm.start_time ||
        !oneTimeForm.end_time
      ) {
        setMessage({
          type: "error",
          text: "Please fill date, start time, and end time.",
        });
        return;
      }

      if (!validateTime(oneTimeForm.start_time, oneTimeForm.end_time)) {
        setMessage({
          type: "error",
          text: "Start time must be before end time.",
        });
        return;
      }

      await API.post("/technicians/availability", {
        available_date: oneTimeForm.available_date,
        start_time: oneTimeForm.start_time,
        end_time: oneTimeForm.end_time,
      });

      setMessage({
        type: "success",
        text: "Availability added successfully.",
      });

      setOneTimeForm({
        available_date: "",
        start_time: "",
        end_time: "",
      });

      await load();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to add availability.",
      });
    }
  };

  const addRegularAvailability = async () => {
    try {
      setMessage(null);

      if (
        !regularForm.month_start ||
        !regularForm.month_end ||
        !regularForm.start_time ||
        !regularForm.end_time
      ) {
        setMessage({
          type: "error",
          text: "Please fill all regular availability fields.",
        });
        return;
      }

      if (regularForm.month_start > regularForm.month_end) {
        setMessage({
          type: "error",
          text: "Month start must be before month end.",
        });
        return;
      }

      if (!validateTime(regularForm.start_time, regularForm.end_time)) {
        setMessage({
          type: "error",
          text: "Start time must be before end time.",
        });
        return;
      }

      await API.post("/technicians/regular-availability", {
        day_of_week: regularForm.day_of_week,
        month_start: regularForm.month_start,
        month_end: regularForm.month_end,
        start_time: regularForm.start_time,
        end_time: regularForm.end_time,
        slot_minutes: Number(regularForm.slot_minutes || 60),
      });

      setMessage({
        type: "success",
        text: "Regular availability added successfully.",
      });

      setRegularForm({
        day_of_week: "All",
        month_start: "",
        month_end: "",
        start_time: "",
        end_time: "",
        slot_minutes: "60",
      });

      await load();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message || "Failed to add regular availability.",
      });
    }
  };

  const deleteAvailability = async (id, type = "one") => {
    try {
      setMessage(null);

      if (type === "regular") {
        await API.delete(`/technicians/regular-availability/${id}`);
      } else {
        await API.delete(`/technicians/availability/${id}`);
      }

      setMessage({
        type: "success",
        text: "Availability deleted successfully.",
      });

      await load();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete availability.",
      });
    }
  };

  const visibleOneTime = useMemo(() => {
    return [...availability].sort((a, b) =>
      `${formatDate(a.available_date)} ${formatTime(a.start_time)}`.localeCompare(
        `${formatDate(b.available_date)} ${formatTime(b.start_time)}`
      )
    );
  }, [availability]);

  const visibleRegular = useMemo(() => {
    return [...regularAvailability].sort(
      (a, b) => Number(b.id || 0) - Number(a.id || 0)
    );
  }, [regularAvailability]);

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Availability" />

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Availability</Text>
          <Text style={appStyles.heroSubtitle}>
            Add one-time or regular available working times.
          </Text>
        </View>

        {message ? (
          <View
            style={
              message.type === "success"
                ? appStyles.successBox
                : appStyles.errorBox
            }
          >
            <Text
              style={
                message.type === "success"
                  ? appStyles.successText
                  : appStyles.errorText
              }
            >
              {message.text}
            </Text>
          </View>
        ) : null}

        <View style={appStyles.card}>
          <Text style={appStyles.sectionTitle}>Add One-Time Availability</Text>

          <Text style={appStyles.label}>Date</Text>
          <TextInput
            style={appStyles.input}
            value={oneTimeForm.available_date}
            onChangeText={(v) =>
              setOneTimeForm({ ...oneTimeForm, available_date: v })
            }
            placeholder="YYYY-MM-DD"
          />

          <Text style={appStyles.label}>Start Time</Text>
          <TextInput
            style={appStyles.input}
            value={oneTimeForm.start_time}
            onChangeText={(v) =>
              setOneTimeForm({ ...oneTimeForm, start_time: v })
            }
            placeholder="08:00"
          />

          <Text style={appStyles.label}>End Time</Text>
          <TextInput
            style={appStyles.input}
            value={oneTimeForm.end_time}
            onChangeText={(v) =>
              setOneTimeForm({ ...oneTimeForm, end_time: v })
            }
            placeholder="12:00"
          />

          <TouchableOpacity
            style={appStyles.primaryBtn}
            onPress={addOneTimeAvailability}
          >
            <Text style={appStyles.primaryBtnText}>Add Availability</Text>
          </TouchableOpacity>
        </View>

        <View style={appStyles.card}>
          <Text style={appStyles.sectionTitle}>Add Regular Availability</Text>

          <Text style={appStyles.label}>Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {days.map((day) => {
                const active = regularForm.day_of_week === day;

                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() =>
                      setRegularForm({ ...regularForm, day_of_week: day })
                    }
                    style={{
                      backgroundColor: active ? colors.primary : colors.primarySoft,
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: active ? "#fff" : colors.primaryDark,
                        fontWeight: "900",
                      }}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <Text style={appStyles.label}>Month Start</Text>
          <TextInput
            style={appStyles.input}
            value={regularForm.month_start}
            onChangeText={(v) =>
              setRegularForm({ ...regularForm, month_start: v })
            }
            placeholder="YYYY-MM-DD"
          />

          <Text style={appStyles.label}>Month End</Text>
          <TextInput
            style={appStyles.input}
            value={regularForm.month_end}
            onChangeText={(v) =>
              setRegularForm({ ...regularForm, month_end: v })
            }
            placeholder="YYYY-MM-DD"
          />

          <Text style={appStyles.label}>Start Time</Text>
          <TextInput
            style={appStyles.input}
            value={regularForm.start_time}
            onChangeText={(v) =>
              setRegularForm({ ...regularForm, start_time: v })
            }
            placeholder="08:00"
          />

          <Text style={appStyles.label}>End Time</Text>
          <TextInput
            style={appStyles.input}
            value={regularForm.end_time}
            onChangeText={(v) =>
              setRegularForm({ ...regularForm, end_time: v })
            }
            placeholder="16:00"
          />

          <Text style={appStyles.label}>Slot Minutes</Text>
          <TextInput
            style={appStyles.input}
            value={regularForm.slot_minutes}
            onChangeText={(v) =>
              setRegularForm({
                ...regularForm,
                slot_minutes: v.replace(/[^\d]/g, ""),
              })
            }
            placeholder="60"
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={appStyles.primaryBtn}
            onPress={addRegularAvailability}
          >
            <Text style={appStyles.primaryBtnText}>Add Regular Availability</Text>
          </TouchableOpacity>
        </View>

        <Text style={appStyles.sectionTitle}>One-Time Availability</Text>

        {visibleOneTime.length === 0 ? (
          <View style={appStyles.card}>
            <Text style={appStyles.mutedText}>No one-time availability yet.</Text>
          </View>
        ) : (
          visibleOneTime.map((item) => (
            <View style={appStyles.card} key={item.id}>
              <Text style={appStyles.text}>
                Date: {formatDate(item.available_date)}
              </Text>

              <Text style={appStyles.text}>
                Time: {formatTime(item.start_time)} - {formatTime(item.end_time)}
              </Text>

              <Text style={appStyles.text}>
                Status: {Number(item.is_booked) === 1 ? "Booked" : "Available"}
              </Text>

              <TouchableOpacity
                style={appStyles.dangerBtn}
                onPress={() => deleteAvailability(item.id, "one")}
              >
                <Text style={appStyles.dangerBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <Text style={appStyles.sectionTitle}>Regular Availability</Text>

        {visibleRegular.length === 0 ? (
          <View style={appStyles.card}>
            <Text style={appStyles.mutedText}>No regular availability yet.</Text>
          </View>
        ) : (
          visibleRegular.map((item) => (
            <View style={appStyles.card} key={item.id}>
              <Text style={appStyles.text}>Day: {item.day_of_week || "-"}</Text>
              <Text style={appStyles.text}>
                From: {formatDate(item.month_start)}
              </Text>
              <Text style={appStyles.text}>
                To: {formatDate(item.month_end)}
              </Text>
              <Text style={appStyles.text}>
                Time: {formatTime(item.start_time)} - {formatTime(item.end_time)}
              </Text>
              <Text style={appStyles.text}>
                Slot: {item.slot_minutes || 60} minutes
              </Text>

              <TouchableOpacity
                style={appStyles.dangerBtn}
                onPress={() => deleteAvailability(item.id, "regular")}
              >
                <Text style={appStyles.dangerBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default TechnicianAvailability;