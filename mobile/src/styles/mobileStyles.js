import { StyleSheet } from "react-native";

const appStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DCCF",
  },

  content: {
    padding: 16,
    paddingBottom: 56,
  },

  mobileHeader: {
    backgroundColor: "#F7F1EA",
    borderBottomWidth: 1,
    borderBottomColor: "#D8C8B8",
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  mobileHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  mobileHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  mobileHeaderIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E0D3C5",
  },

  mobileHeaderIconText: {
    fontSize: 20,
    color: "#111",
    fontWeight: "700",
  },

  mobileHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    flexShrink: 1,
  },

  mobileLogoutBtn: {
    backgroundColor: "#111",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
  },

  mobileLogoutBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  mobileMenuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 14,
  },

  mobileMenuSheet: {
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },

  mobileMenuTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111",
  },

  mobileMenuItem: {
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F1E5D8",
    marginBottom: 8,
  },

  mobileMenuItemText: {
    fontSize: 15,
    color: "#111",
    fontWeight: "600",
  },

  mobileNotificationBox: {
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 15,
    color: "#555",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2A211B",
    marginBottom: 7,
    marginTop: 8,
  },

  infoRow: {
    fontSize: 15,
    color: "#3A3028",
    marginBottom: 8,
    lineHeight: 22,
  },

  input: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
    marginBottom: 14,
  },

  primaryBtn: {
    backgroundColor: "#111111",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 36,
  },

  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryBtn: {
    backgroundColor: "#FFF9F3",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    marginBottom: 12,
  },

  secondaryBtnText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "700",
  },

  dangerBtn: {
    backgroundColor: "#B42318",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },

  dangerBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  homeTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
    marginBottom: 18,
    textAlign: "center",
  },

  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  serviceItem: {
    width: "47%",
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  serviceCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E8DCCF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  serviceName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
  },

  messageTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111",
    marginBottom: 8,
  },

  messageBody: {
    fontSize: 14,
    color: "#444",
    lineHeight: 21,
  },

  chatContainer: {
    flex: 1,
    backgroundColor: "#E8DCCF",
  },

  chatHeaderBar: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#D8C8B8",
    alignItems: "center",
    backgroundColor: "#111",
  },

  chatAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },

  chatTitleBlock: {
    flex: 1,
  },

  chatTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },

  chatSubtitle: {
    fontSize: 12,
    color: "#ddd",
  },

  messagesContainer: {
    flex: 1,
    padding: 15,
  },

  messageBubble: {
    maxWidth: "82%",
    padding: 12,
    borderRadius: 15,
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
    fontSize: 15,
    lineHeight: 22,
  },

  myText: {
    color: "#fff",
  },

  otherText: {
    color: "#111",
  },

  sentImage: {
    width: 220,
    height: 180,
    borderRadius: 10,
    marginBottom: 7,
  },

  previewBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#D8C8B8",
    backgroundColor: "#FFF9F3",
  },

  previewImage: {
    width: 75,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },

  removeBtn: {
    backgroundColor: "#111",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  removeBtnText: {
    color: "#fff",
    fontWeight: "800",
  },

  chatInputArea: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#D8C8B8",
    alignItems: "center",
    backgroundColor: "#FFF9F3",
  },

  chatInput: {
    flex: 1,
    backgroundColor: "#F8F1EA",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 9,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    color: "#111",
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F8F1EA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },

  iconText: {
    fontSize: 19,
  },

  sendBtn: {
    backgroundColor: "#111",
    paddingVertical: 10,
    paddingHorizontal: 17,
    borderRadius: 20,
  },

  sendBtnText: {
    color: "#fff",
    fontWeight: "800",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  spaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    textAlign: "center",
    color: "#555",
    fontSize: 15,
    marginTop: 20,
  },
});

export default appStyles;