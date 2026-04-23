import { StyleSheet } from "react-native";

const appStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DCCF",
  },

  container: {
    flex: 1,
  },

  content: {
    padding: 16,
  },

  header: {
    backgroundColor: "#FFF9F3",
    borderBottomWidth: 1,
    borderBottomColor: "#D8C8B8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  brand: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111111",
    marginLeft: 10,
    flexShrink: 1,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EFE4D8",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  iconText: {
    fontSize: 18,
  },

  logoutBtn: {
    backgroundColor: "#111111",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 10,
  },

  logoutText: {
    color: "#F5EEE6",
    fontWeight: "700",
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 999,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-start",
    paddingTop: 90,
    paddingHorizontal: 14,
  },

  dropdownSheet: {
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },

  notificationsSheet: {
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    maxHeight: "70%",
  },

  dropdownTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 10,
  },

  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  dropdownItemText: {
    fontSize: 15,
    color: "#111111",
    fontWeight: "600",
  },

  notificationItem: {
    backgroundColor: "#F5EEE6",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },

  notificationTitle: {
    fontWeight: "700",
    color: "#111111",
    marginBottom: 4,
  },

  notificationBody: {
    color: "#6B5E52",
    lineHeight: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 18,
  },

  card: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  panel: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 18,
    padding: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 14,
    color: "#111111",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F8F1E8",
    fontSize: 16,
  },

  readonlyField: {
    backgroundColor: "#F6EDE2",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F8F1E8",
  },

  primaryBtn: {
    backgroundColor: "#111111",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  primaryBtnText: {
    color: "#FFF9F3",
    fontWeight: "700",
  },

  secondaryBtn: {
    backgroundColor: "#EFE4D8",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  secondaryBtnText: {
    color: "#111111",
    fontWeight: "700",
  },

  messageCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },

  successCard: {
    backgroundColor: "#F5FBF6",
    borderColor: "#CFE8D4",
  },

  warningCard: {
    backgroundColor: "#FFF8EF",
    borderColor: "#EFD7AB",
  },

  errorCard: {
    backgroundColor: "#FFF3F3",
    borderColor: "#EFC3C3",
  },

  messageTitle: {
    fontWeight: "800",
    color: "#111111",
    marginBottom: 6,
  },

  messageBody: {
    color: "#6B5E52",
    lineHeight: 20,
  },

  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  profileIdentity: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 14,
  },

  avatarText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 6,
  },

  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFE4D8",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 18,
  },

  roleText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  infoRow: {
    fontSize: 15,
    color: "#3A3028",
    lineHeight: 22,
    marginBottom: 8,
  },

  bold: {
    fontWeight: "700",
    color: "#111111",
  },

  modalCard: {
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },

  menuCard: {
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },

  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  menuItemText: {
    fontSize: 15,
    color: "#111111",
    fontWeight: "600",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 15,
    textAlign: "center",
    color: "#111111",
  },

  modalActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  photoPreviewWrap: {
    alignItems: "center",
    marginBottom: 16,
  },

  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  mapContainer: {
    height: 200,
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },

  map: {
    flex: 1,
  },

  chatCard: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  chatCardAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  chatCardAvatarText: {
    color: "#FFF9F3",
    fontWeight: "800",
    fontSize: 18,
  },

  chatCardContent: {
    flex: 1,
  },

  chatCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  chatCardName: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 16,
  },

  chatCardTime: {
    color: "#6B5E52",
    fontSize: 12,
  },

  chatCardPreview: {
    color: "#6B5E52",
    fontSize: 14,
  },

  chatTopBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#EFE4D8",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },

  backBtnText: {
    color: "#111111",
    fontWeight: "700",
  },

  chatHeaderBar: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#D8C8B8",
    alignItems: "center",
    backgroundColor: "#FFF9F3",
  },

  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFE4D8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  chatTitleBlock: {
    flex: 1,
  },

  chatTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111111",
  },

  chatStatus: {
    fontSize: 12,
    color: "#6B5E52",
  },

  messagesContainer: {
    flex: 1,
    padding: 15,
  },

  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },

  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#111111",
  },

  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },

  messageText: {
    fontSize: 15,
  },

  myText: {
    color: "#FFF9F3",
  },

  otherText: {
    color: "#111111",
  },

  sentImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },

  locationText: {
    color: "#1d4ed8",
    textDecorationLine: "underline",
    fontWeight: "600",
  },

  chatInputArea: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#D8C8B8",
    alignItems: "center",
    backgroundColor: "#FFF9F3",
  },

  chatInput: {
    flex: 1,
    backgroundColor: "#F8F1E8",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },

  iconBtn: {
    padding: 8,
  },

  iconBtnText: {
    fontSize: 20,
  },

  mobileHeader: {
  minHeight: 72,
  backgroundColor: "#F7F1EA",
  borderBottomWidth: 1,
  borderBottomColor: "#D8C8B8",
  paddingHorizontal: 14,
  paddingTop: 10,
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
  marginLeft: 10,
},

mobileHeaderTitle: {
  fontSize: 20,
  fontWeight: "800",
  color: "#111111",
  marginLeft: 10,
  flexShrink: 1,
},

mobileHeaderIconBtn: {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: "#ECE2D6",
  alignItems: "center",
  justifyContent: "center",
},

mobileHeaderIconText: {
  fontSize: 20,
  color: "#111111",
  fontWeight: "700",
},

mobileLogoutBtn: {
  marginLeft: 10,
  backgroundColor: "#111111",
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 12,
},

mobileLogoutBtnText: {
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: "700",
},

mobileMenuOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.28)",
  justifyContent: "flex-start",
},

mobileMenuSheet: {
  marginTop: 78,
  marginLeft: 12,
  marginRight: 12,
  backgroundColor: "#FFF9F3",
  borderRadius: 18,
  padding: 12,
  borderWidth: 1,
  borderColor: "#D8C8B8",
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 14,
  elevation: 10,
},

mobileMenuTitle: {
  fontSize: 18,
  fontWeight: "800",
  color: "#111111",
  marginBottom: 8,
},

mobileMenuItem: {
  paddingVertical: 14,
  paddingHorizontal: 12,
  borderRadius: 12,
  marginBottom: 6,
  backgroundColor: "#F4ECE2",
},

mobileMenuItemText: {
  fontSize: 16,
  fontWeight: "600",
  color: "#111111",
},

mobileNotificationBox: {
  marginTop: 78,
  marginRight: 12,
  marginLeft: "auto",
  width: 280,
  backgroundColor: "#FFF9F3",
  borderRadius: 18,
  padding: 14,
  borderWidth: 1,
  borderColor: "#D8C8B8",
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 14,
  elevation: 10,
},
mapPlaceholder: {
  backgroundColor: "#F7F1EA",
  borderWidth: 1,
  borderColor: "#D8C8B8",
  borderRadius: 16,
  padding: 16,
  marginTop: 6,
},

mapPlaceholderTitle: {
  fontSize: 16,
  fontWeight: "800",
  color: "#111111",
  marginBottom: 8,
},

mapPlaceholderText: {
  fontSize: 14,
  color: "#444444",
  lineHeight: 20,
  marginBottom: 12,
},
});

export default appStyles;