import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";

export default function CustomDropdown({ value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((item) => item.value === value);

  return (
    <>
      <TouchableOpacity style={styles.select} onPress={() => setOpen(true)}>
        <Text style={styles.selectText} numberOfLines={1}>
          {selected?.label || placeholder || "Select"}
        </Text>
        <Text style={styles.arrow}>⌄</Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.menu}>
            <ScrollView>
              {options.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.option, value === item.value && styles.activeOption]}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === item.value && styles.activeOptionText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  select: {
    height: 58,
    borderRadius: 999,
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
  },
  arrow: {
    color: "#111",
    fontSize: 22,
    fontWeight: "900",
    marginLeft: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  menu: {
    maxHeight: "70%",
    backgroundColor: "#FFF9F3",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    padding: 10,
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  activeOption: {
    backgroundColor: "#111",
  },
  optionText: {
    fontSize: 18,
    color: "#111",
    fontWeight: "700",
  },
  activeOptionText: {
    color: "#FFF",
  },
});