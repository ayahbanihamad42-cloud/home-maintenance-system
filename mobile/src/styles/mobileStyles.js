import { StyleSheet } from "react-native";

export const colors = {
  primary: "#7C3AED",
  primaryDark: "#5B21B6",
  primarySoft: "#F3E8FF",
  accent: "#EC4899",
  bg: "#FBFAFF",
  card: "#FFFFFF",
  text: "#1F1633",
  muted: "#7C6F92",
  border: "#EADCFB",
  danger: "#DC2626",
  success: "#16A34A",
};

const appStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1, backgroundColor: colors.bg },
  pageContent: { padding: 18, paddingBottom: 100 },

  hero: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
  },
  heroTitle: { color: "#fff", fontSize: 30, fontWeight: "900" },
  heroSubtitle: { color: "#F5EFFF", marginTop: 8, fontSize: 15, lineHeight: 23 },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  pageTitle: { fontSize: 30, fontWeight: "900", color: colors.text, marginBottom: 14 },
  sectionTitle: { fontSize: 22, fontWeight: "900", color: colors.text, marginBottom: 10 },
  text: { fontSize: 16, color: colors.text, lineHeight: 23 },
  mutedText: { fontSize: 14, color: colors.muted, lineHeight: 21 },

  label: { fontSize: 14, fontWeight: "900", color: colors.text, marginBottom: 7, marginTop: 10 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    minHeight: 52,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
  },
  textArea: { minHeight: 110, paddingTop: 12, textAlignVertical: "top" },

  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },

  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  secondaryBtnText: { color: colors.primaryDark, fontSize: 15, fontWeight: "900" },

  dangerBtn: {
    backgroundColor: colors.danger,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 10,
  },

  successBox: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  successText: { color: colors.success, fontWeight: "800" },
  errorText: { color: colors.danger, fontWeight: "800" },

  statusBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  statusText: { color: colors.primaryDark, fontWeight: "900", fontSize: 13 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  serviceCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    alignItems: "center",
    minHeight: 135,
  },
  serviceIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  serviceName: { fontSize: 15, fontWeight: "900", color: colors.text, textAlign: "center" },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primarySoft,
    borderWidth: 4,
    borderColor: "#fff",
  },

  floatingBtn: {
    position: "absolute",
    right: 18,
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  floatingBtnText: { color: "#fff", fontSize: 24, fontWeight: "900" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(31,22,51,0.35)",
    justifyContent: "center",
    padding: 18,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    maxHeight: "88%",
  },
});

export default appStyles;