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

import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import appStyles, { colors } from "../../styles/mobileStyles";
import API from "../../services/api";

const days = ["All", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function TechnicianAvailability({ navigation }) {
  const { t } = useTranslation();
  const { c } = useTheme();
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
        text: err.response?.data?.message || t("techAvailability.failedLoad"),
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
        setMessage({ type: "error", text: t("techAvailability.fillDateStartEnd") });
        return;
      }

      if (!validateTime(oneForm.start_time, oneForm.end_time)) {
        setMessage({ type: "error", text: t("techAvailability.startBeforeEnd") });
        return;
      }

      if (existsInOneTime(oneForm.available_date, oneForm.start_time, oneForm.end_time)) {
        setMessage({ type: "error", text: t("techAvailability.oneTimeOverlap") });
        return;
      }

      if (existsInRegular(oneForm.available_date, "All", oneForm.start_time, oneForm.end_time)) {
        setMessage({ type: "error", text: t("techAvailability.regularOverlap") });
        return;
      }

      await API.post("/technicians/availability", {
        available_date: oneForm.available_date,
        start_time: normalizeTime(oneForm.start_time),
        end_time: normalizeTime(oneForm.end_time),
      });

      setOneForm({ available_date: "", start_time: "08:00", end_time: "12:00" });
      setMessage({ type: "success", text: t("techAvailability.addedSuccess") });
      await load();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || t("techAvailability.failedAdd") });
    }
  };

  const addRegular = async () => {
    try {
      setMessage(null);

      if (!regularForm.month_start || !regularForm.month_end || !regularForm.start_time || !regularForm.end_time) {
        setMessage({ type: "error", text: t("techAvailability.fillAllRegular") });
        return;
      }

      if (regularForm.month_start > regularForm.month_end) {
        setMessage({ type: "error", text: t("techAvailability.monthStartBeforeEnd") });
        return;
      }

      if (!validateTime(regularForm.start_time, regularForm.end_time)) {
        setMessage({ type: "error", text: t("techAvailability.startBeforeEnd") });
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
        setMessage({ type: "error", text: t("techAvailability.regularDuplicate") });
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
        setMessage({ type: "error", text: t("techAvailability.regularOverlapsOneTime") });
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

      setMessage({ type: "success", text: t("techAvailability.regularAddedSuccess") });
      await load();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || t("techAvailability.failedAddRegular") });
    }
  };

  const deleteAvailability = (id, type) => {
    Alert.alert(t("techAvailability.deleteTitle"), t("techAvailability.deleteConfirm"), [
      { text: t("techAvailability.cancel"), style: "cancel" },
      {
        text: t("techAvailability.delete"),
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
            setMessage({ type: "error", text: t("techAvailability.failedDelete") });
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
    <SafeAreaView style={[appStyles.safe, { backgroundColor: c.bg }]}>
      <Header navigation={navigation} title={t("techAvailability.headerTitle")} />

      <ScrollView contentContainerStyle={appStyles.pageContent} showsVerticalScrollIndicator={false}>
        <HeroSection title={t("techAvailability.title")} subtitle={t("techAvailability.subtitle")} />

        {message ? (
          <View style={message.type === "success" ? appStyles.successBox : appStyles.errorBox}>
            <Text style={message.type === "success" ? appStyles.successText : appStyles.errorText}>{message.text}</Text>
          </View>
        ) : null}

        <View style={appStyles.row}>
          <TouchableOpacity
            style={[appStyles.secondaryBtn, { flex: 1, backgroundColor: mode === "one" ? c.primary : c.card }]}
            onPress={() => setMode("one")}
          >
            <Text style={{ color: mode === "one" ? "#fff" : c.primary, fontWeight: "900", textAlign: "center" }}>{t("techAvailability.oneTime")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[appStyles.secondaryBtn, { flex: 1, backgroundColor: mode === "regular" ? c.primary : c.card }]}
            onPress={() => setMode("regular")}
          >
            <Text style={{ color: mode === "regular" ? "#fff" : c.primary, fontWeight: "900", textAlign: "center" }}>{t("techAvailability.regular")}</Text>
          </TouchableOpacity>
        </View>

        {mode === "one" ? (
          <View style={[appStyles.card, { backgroundColor: c.card }]}>
            <Text style={[appStyles.sectionTitle, { color: c.text }]}>{t("techAvailability.addOneTimeTitle")}</Text>

            <Text style={[appStyles.label, { color: c.text }]}>{t("techAvailability.dateLabel")}</Text>
            <TouchableOpacity style={[appStyles.input, { backgroundColor: c.inputBg, borderColor: c.border }]} onPress={() => setShowPicker("one_date")}>
              <Text style={[appStyles.text, { color: c.text }]}>{oneForm.available_date || t("techAvailability.chooseDate")}</Text>
            </TouchableOpacity>

            <Text style={[appStyles.label, { color: c.text }]}>{t("techAvailability.startTime")}</Text>
            <TextInput style={[appStyles.input, { backgroundColor: c.inputBg, borderColor: c.border, color: c.text }]} value={oneForm.start_time} onChangeText={(v) => setOneForm((p) => ({ ...p, start_time: v }))} placeholder="08:00" placeholderTextColor={c.muted} />

            <Text style={[appStyles.label, { color: c.text }]}>{t("techAvailability.endTime")}</Text>
            <TextInput style={[appStyles.input, { backgroundColor: c.inputBg, borderColor: c.border, color: c.text }]} value={oneForm.end_time} onChangeText={(v) => setOneForm((p) => ({ ...p, end_time: v }))} placeholder="12:00" placeholderTextColor={c.muted} />

            <TouchableOpacity style={appStyles.primaryBtn} onPress={addOneTime}>
              <Text style={appStyles.primaryBtnText}>{t("techAvailability.addAvailability")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[appStyles.card, { backgroundColor: c.card }]}>
            <Text style={[appStyles.sectionTitle, { color: c.text }]}>{t("techAvailability.addRegularTitle")}</Text>

            <Text style={[appStyles.label, { color: c.text }]}>{t("techAvailability.dayLabel")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {days.map((day) => {
                const active = regularForm.day_of_week === day;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[appStyles.secondaryBtn, { marginRight: 8, paddingHorizontal: 18, backgroundColor: active ? c.primary : c.primarySoft }]}
                    onPress={() => setRegularForm((p) => ({ ...p, day_of_week: day }))}
                  >
                    <Text style={{ color: active ? "#fff" : c.primary, fontWeight: "900" }}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[appStyles.label, { color: c.text }]}>{t("techAvailability.monthStart")}</Text>
            <TouchableOpacity style={[appStyles.input, { backgroundColor: c.inputBg, borderColor: c.border }]} onPress={() => setShowPicker("regular_start")}>
              <Text style={[appStyles.text, { color: c.text }]}>{regularForm.month_start || t("techAvailability.chooseStartDate")}</Text>
            </TouchableOpacity>

            <Text style={[appStyles.label, { color: c.text }]}>{t("techAvailability.monthEnd")}</Text>
            <TouchableOpacity style={[appStyles.input, { backgroundColor: c.inputBg, borderColor: c.border }]} onPress={() => setShowPicker("regular_end")}>
              <Text style={[appStyles.text, { color: c.text }]}>{regularForm.month_end || t("techAvailability.chooseEndDate")}</Text>
            </TouchableOpacity>

            <Text style={[appStyles.label, { color: c.text }]}>{t("techAvailability.startTime")}</Text>
            <TextInput style={[appStyles.input, { backgroundColor: c.inputBg, borderColor: c.border, color: c.text }]} value={regularForm.start_time} onChangeText={(v) => setRegularForm((p) => ({ ...p, start_time: v }))} placeholder="08:00" placeholderTextColor={c.muted} />

            <Text style={[appStyles.label, { color: c.text }]}>{t("techAvailability.endTime")}</Text>
            <TextInput style={[appStyles.input, { backgroundColor: c.inputBg, borderColor: c.border, color: c.text }]} value={regularForm.end_time} onChangeText={(v) => setRegularForm((p) => ({ ...p, end_time: v }))} placeholder="12:00" placeholderTextColor={c.muted} />

            <TouchableOpacity style={appStyles.primaryBtn} onPress={addRegular}>
              <Text style={appStyles.primaryBtnText}>{t("techAvailability.addRegularAvailability")}</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[appStyles.sectionTitle, { color: c.text }]}>{mode === "one" ? t("techAvailability.oneTimeList") : t("techAvailability.regularList")}</Text>

        {mode === "one" ? (
          visibleOneTime.length === 0 ? (
            <View style={[appStyles.card, { backgroundColor: c.card }]}><Text style={[appStyles.mutedText, { color: c.muted }]}>{t("techAvailability.noOneTime")}</Text></View>
          ) : (
            visibleOneTime.map((item) => (
              <View style={[appStyles.card, { backgroundColor: c.card }]} key={item.id}>
                <Text style={[appStyles.sectionTitle, { color: c.text }]}>{normalizeDate(item.available_date)}</Text>
                <Text style={[appStyles.text, { color: c.text }]}>{t("techAvailability.timeLabel")} {item.start_time} - {item.end_time}</Text>
                <TouchableOpacity style={appStyles.secondaryBtn} onPress={() => deleteAvailability(item.id, "one")}>
                  <Text style={appStyles.secondaryBtnText}>{t("techAvailability.delete")}</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        ) : visibleRegular.length === 0 ? (
          <View style={[appStyles.card, { backgroundColor: c.card }]}><Text style={[appStyles.mutedText, { color: c.muted }]}>{t("techAvailability.noRegular")}</Text></View>
        ) : (
          visibleRegular.map((item) => (
            <View style={[appStyles.card, { backgroundColor: c.card }]} key={item.id}>
              <Text style={[appStyles.sectionTitle, { color: c.text }]}>{item.day_of_week || t("techAvailability.regular")}</Text>
              <Text style={[appStyles.text, { color: c.text }]}>{t("techAvailability.from")} {normalizeDate(item.month_start)}</Text>
              <Text style={[appStyles.text, { color: c.text }]}>{t("techAvailability.to")} {normalizeDate(item.month_end)}</Text>
              <Text style={[appStyles.text, { color: c.text }]}>{t("techAvailability.timeLabel")} {item.start_time} - {item.end_time}</Text>
              <TouchableOpacity style={appStyles.secondaryBtn} onPress={() => deleteAvailability(item.id, "regular")}>
                <Text style={appStyles.secondaryBtnText}>{t("techAvailability.delete")}</Text>
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