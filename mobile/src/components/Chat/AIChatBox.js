import React, { useState } from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import appStyles from "../../styles/mobileStyles";

function AIBox({ onAsk }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onAsk(text);
    setText("");
  };

  return (
    <View style={{ padding: 12 }}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Ask AI..."
        placeholderTextColor="#777"
        multiline
        style={[appStyles.input, { minHeight: 100, textAlignVertical: "top" }]}
      />

      <Pressable onPress={submit} style={appStyles.primaryBtn}>
        <Text style={appStyles.primaryBtnText}>Ask</Text>
      </Pressable>
    </View>
  );
}

export default AIBox;