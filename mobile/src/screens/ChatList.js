import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/Common/Header";
import { getChatConversations } from "../services/chatService";
import appStyles from "../styles/mobileStyles";

function ChatList({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChatConversations()
      .then((data) => setConversations(data || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  const renderLastMessage = (item) => {
    if (item.lastMessageType === "image") return "📷 Image";
    if (item.lastMessageType === "location") return "📍 Location";
    return item.lastMessage || "No messages yet";
  };

  return (
    <SafeAreaView style={appStyles.screen}>
      <Header />

      <ScrollView contentContainerStyle={appStyles.content}>
        <Text style={appStyles.title}>Chats</Text>

        {loading ? (
          <View style={appStyles.messageCard}>
            <Text style={appStyles.messageTitle}>Notice</Text>
            <Text style={appStyles.messageBody}>Loading conversations...</Text>
          </View>
        ) : conversations.length === 0 ? (
          <View style={appStyles.messageCard}>
            <Text style={appStyles.messageTitle}>No chats yet</Text>
            <Text style={appStyles.messageBody}>
              Your conversations will appear here when you start chatting.
            </Text>
          </View>
        ) : (
          conversations.map((item) => (
            <TouchableOpacity
              key={item.userId}
              style={appStyles.chatCard}
              onPress={() => navigation.navigate("Chat", { userId: item.userId })}
            >
              <View style={appStyles.chatCardAvatar}>
                <Text style={appStyles.chatCardAvatarText}>
                  {(item.name || "?").charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={appStyles.chatCardContent}>
                <View style={appStyles.chatCardTop}>
                  <Text style={appStyles.chatCardName}>{item.name}</Text>
                  <Text style={appStyles.chatCardTime}>
                    {item.lastMessageAt
                      ? new Date(item.lastMessageAt).toLocaleString()
                      : ""}
                  </Text>
                </View>

                <Text style={appStyles.chatCardPreview}>
                  {renderLastMessage(item)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default ChatList;
