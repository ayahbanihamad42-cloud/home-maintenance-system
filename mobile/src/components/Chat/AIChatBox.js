import React, { useState } from "react";
import { View, TextInput, Pressable, Text } from "react-native";

function AIBox({ onAsk }) {

  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onAsk(text);
    setText("");
  };

  return (
    <View style={{ padding: 10 }}>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Ask AI..."
        multiline
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10
        }}
      />

      <Pressable
        onPress={submit}
        style={{ backgroundColor: "#007bff", padding: 10 }}
      >
        <Text style={{ color: "#fff" }}>Ask</Text>
      </Pressable>

    </View>
  );
}

export default AIBox;