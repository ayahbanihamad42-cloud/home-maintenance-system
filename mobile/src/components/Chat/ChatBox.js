import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import appStyles from "../../styles/mobileStyles";

function ChatBox({ messages = [], onSend }) {
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

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
      <ScrollView
        ref={scrollRef}
        style={appStyles.messagesContainer}
        contentContainerStyle={{ paddingBottom: 12 }}
      >
        {messages.map((m, i) => (
          <View
            key={i}
            style={[
              appStyles.messageBubble,
              m.sender === "me" || m.sender_id === m.currentUserId
                ? appStyles.myMessage
                : appStyles.otherMessage,
            ]}
          >
            <Text
              style={[
                appStyles.messageText,
                m.sender === "me" || m.sender_id === m.currentUserId
                  ? appStyles.myText
                  : appStyles.otherText,
              ]}
            >
              {m.message}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={appStyles.chatInputArea}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={appStyles.chatInput}
          placeholder="Type a message..."
          placeholderTextColor="#777"
        />

        <Pressable onPress={send} style={appStyles.primaryBtn}>
          <Text style={appStyles.primaryBtnText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default ChatBox;