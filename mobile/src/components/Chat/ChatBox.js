import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";

function ChatBox({ messages, onSend }) {

  const [text, setText] = useState("");
  const scrollRef = useRef();

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={{ flex: 1 }}>

      {/* Messages */}
      <ScrollView ref={scrollRef} style={{ flex: 1, padding: 10 }}>
        {messages.map((m, i) => (
          <View key={i} style={{ marginVertical: 5 }}>
            <Text>{m.message}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={{ flexDirection: "row", padding: 10 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={{ flex: 1, borderWidth: 1, marginRight: 5 }}
        />

        <Pressable
          onPress={send}
          style={{ backgroundColor: "#007bff", padding: 10 }}
        >
          <Text style={{ color: "#fff" }}>Send</Text>
        </Pressable>
      </View>

    </View>
  );
}

export default ChatBox;