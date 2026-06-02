import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { colors } from "../../styles/mobileStyles";

function CustomDropdown({
  label,
  value,
  options = [],
  placeholder = "Select...",
  onChange,
}) {
  const [open, setOpen] = useState(false);

  const selected = options.find((item) => String(item.value) === String(value));
  const display = selected?.label || placeholder;

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
        <Text style={styles.buttonText}>{display}</Text>
        <Text style={styles.arrow}>⌄</Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.menu}>
            <Text style={styles.menuTitle}>{label || "Choose"}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((item) => {
                const active = String(item.value) === String(value);

                return (
                  <TouchableOpacity
                    key={String(item.value)}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => {
                      onChange?.(item.value, item);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 9,
  },
  button: {
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  arrow: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(31,22,51,0.38)",
    justifyContent: "center",
    padding: 22,
  },
  menu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    maxHeight: "72%",
  },
  menuTitle: {
    fontSize: 25,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 14,
  },
  option: {
    backgroundColor: "#FBFAFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
});

export default CustomDropdown;