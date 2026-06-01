import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import appStyles, { colors } from "../../styles/mobileStyles";

const FloatingActions = ({ navigation }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [text, setText] = useState("");

  return (
    <>
      <TouchableOpacity
        style={[appStyles.floatingBtn, { bottom: 92 }]}
        onPress={() => setChatOpen(true)}
      >
        <Text style={appStyles.floatingBtnText}>💬</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[appStyles.floatingBtn, { bottom: 24 }]}
        onPress={() => setAiOpen(true)}
      >
        <Text style={appStyles.floatingBtnText}>✨</Text>
      </TouchableOpacity>

      <Modal transparent visible={chatOpen} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <View style={appStyles.between}>
              <Text style={appStyles.sectionTitle}>Chat</Text>
              <TouchableOpacity onPress={() => setChatOpen(false)}>
                <Text style={{ fontSize: 24, color: colors.primary }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }}>
              <View style={appStyles.card}>
                <Text style={appStyles.mutedText}>
                  Open your conversations or send messages from the chat screen.
                </Text>
              </View>
            </ScrollView>

            <TextInput
              style={appStyles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
            />

            <View style={appStyles.row}>
              <TouchableOpacity
                style={[appStyles.secondaryBtn, { flex: 1 }]}
                onPress={() => navigation.navigate("ChatList")}
              >
                <Text style={appStyles.secondaryBtnText}>Open Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[appStyles.secondaryBtn, { flex: 1 }]}
              >
                <Text style={appStyles.secondaryBtnText}>📷 Image</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[appStyles.secondaryBtn, { flex: 1 }]}
              >
                <Text style={appStyles.secondaryBtnText}>📍 Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={aiOpen} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <View style={appStyles.between}>
              <Text style={appStyles.sectionTitle}>AI Assistant</Text>
              <TouchableOpacity onPress={() => setAiOpen(false)}>
                <Text style={{ fontSize: 24, color: colors.primary }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={appStyles.card}>
              <Text style={appStyles.mutedText}>
                Ask about repairs, services, technician selection, or decoration ideas.
              </Text>
            </View>

            <TextInput
              style={appStyles.input}
              placeholder="Ask anything..."
              value={text}
              onChangeText={setText}
            />

            <View style={appStyles.row}>
              <TouchableOpacity
                style={[appStyles.secondaryBtn, { flex: 1 }]}
              >
                <Text style={appStyles.secondaryBtnText}>📷 Image</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[appStyles.primaryBtn, { flex: 1 }]}
                onPress={() => navigation.navigate("AIChat")}
              >
                <Text style={appStyles.primaryBtnText}>Ask</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default FloatingActions;