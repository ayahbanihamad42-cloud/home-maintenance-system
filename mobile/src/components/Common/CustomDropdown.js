import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";

function CustomDropdown({ value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);

  const selected = options.find((item) => item.value === value);

  return (
    <>
      <TouchableOpacity style={styles.select} onPress={() => setOpen(true)}>
        <Text style={styles.selectText}>
          {selected?.label || placeholder || "Select"}
        </Text>
        <Text style={styles.arrow}>⌄</Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            {options.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.option,
                  value === item.value && styles.activeOption,
                ]}
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
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  select: {
    height: 52,
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
  },
  arrow: {
    color: "#111",
    fontSize: 22,
    fontWeight: "900",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  menu: {
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

export default CustomDropdown;