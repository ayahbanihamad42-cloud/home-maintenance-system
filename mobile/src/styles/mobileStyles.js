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
  warning: "#B45309",
};

const appStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  pageContent: {
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 120,
  },

  authContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 42,
  },

  brandText: {
    fontSize: 56,
    fontWeight: "900",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 28,
  },

  hero: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingVertical: 30,
    paddingHorizontal: 22,
    marginBottom: 26,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 42,
  },

  heroSubtitle: {
    color: "#F5EFFF",
    marginTop: 14,
    fontSize: 17,
    lineHeight: 28,
    fontWeight: "500",
  },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.13,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  authCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    padding: 22,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  pageTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 14,
  },

  text: {
    fontSize: 17,
    color: colors.text,
    lineHeight: 28,
  },

  mutedText: {
    fontSize: 16,
    color: colors.muted,
    lineHeight: 25,
    marginBottom: 8,
  },

  label: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 9,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    minHeight: 58,
    paddingHorizontal: 16,
    fontSize: 17,
    color: colors.text,
  },

  textArea: {
    minHeight: 120,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },

  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    paddingVertical: 17,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  secondaryBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  secondaryBtnText: {
    color: colors.primaryDark,
    fontSize: 17,
    fontWeight: "900",
  },

  dangerBtn: {
    backgroundColor: colors.danger,
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  dangerBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },

  successBox: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
    marginBottom: 16,
  },

  errorBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
    marginBottom: 16,
  },

  warningBox: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
    marginBottom: 16,
  },

  successText: {
    color: colors.success,
    fontWeight: "900",
    fontSize: 15,
    lineHeight: 23,
  },

  errorText: {
    color: colors.danger,
    fontWeight: "900",
    fontSize: 15,
    lineHeight: 23,
  },

  warningText: {
    color: colors.warning,
    fontWeight: "900",
    fontSize: 15,
    lineHeight: 23,
  },

  statusBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },

  statusText: {
    color: colors.primaryDark,
    fontWeight: "900",
    fontSize: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },

  serviceCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 168,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  serviceIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },

  serviceImage: {
    width: 58,
    height: 58,
    resizeMode: "contain",
  },

  serviceName: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },

  avatarCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    fontSize: 28,
    color: colors.primaryDark,
    fontWeight: "900",
  },

  floatingBtn: {
    position: "absolute",
    right: 18,
    width: 62,
    height: 62,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  floatingBtnText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(31,22,51,0.38)",
    justifyContent: "center",
    padding: 18,
  },

  modalBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    maxHeight: "88%",
  },

  modalTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 16,
  },
});

export default appStyles;