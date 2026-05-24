import { StyleSheet } from "react-native";

const appStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DCCF",
  },

  pageContent: {
    padding: 24,
    paddingBottom: 90,
  },

  card: {
    backgroundColor: "#FFF9F3",
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  pageTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111",
    marginBottom: 18,
  },

  label: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2F2723",
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#F7EFE7",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 18,
    minHeight: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111",
  },

  textArea: {
    minHeight: 120,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  pickerBox: {
    backgroundColor: "#F7EFE7",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 18,
    overflow: "hidden",
  },

  primaryBtn: {
    backgroundColor: "#111",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  primaryBtnText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "900",
  },

  errorBox: {
    backgroundColor: "#FDEBED",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F5B7BD",
  },

  successBox: {
    backgroundColor: "#EAF7EC",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BEE5C5",
  },

  errorTitle: {
    color: "#B4232B",
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 4,
  },

  successTitle: {
    color: "#176B2C",
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 4,
  },

  errorText: {
    color: "#B4232B",
    fontSize: 15,
    fontWeight: "600",
  },

  successText: {
    color: "#176B2C",
    fontSize: 15,
    fontWeight: "600",
  },

  twoColumns: {
    gap: 14,
  },

  column: {
    flex: 1,
  },

  messagesContainer: {
    padding: 16,
    paddingBottom: 110,
  },

  messageBubble: {
    maxWidth: "78%",
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
  },

  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#111",
  },

  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },

  myText: {
    color: "#FFF",
  },

  otherText: {
    color: "#111",
  },

  chatInputArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFF9F3",
    borderTopWidth: 1,
    borderTopColor: "#D8C8B8",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  chatInput: {
    flex: 1,
    backgroundColor: "#F7EFE7",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
});

export default appStyles;