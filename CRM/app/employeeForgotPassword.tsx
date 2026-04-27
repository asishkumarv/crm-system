import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  Portal,
  Dialog,
} from "react-native-paper";
import { router } from "expo-router";
import API from "../services/api";

const { width, height } = Dimensions.get("window");

type Step = "email" | "otp" | "newPassword";

export default function EmployeeForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogMsg, setDialogMsg] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogSuccess, setDialogSuccess] = useState(false);

  const showDialog = (msg: string, success = false) => {
    setDialogMsg(msg);
    setDialogSuccess(success);
    setDialogVisible(true);
  };

  const handleRequestOtp = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await API.post("/employee/forgot-password", { email });
      showDialog("OTP sent to your email. Please check your inbox.", true);
      setStep("otp");
    } catch (err: any) {
      showDialog(err.response?.data?.message || "Failed to send OTP. Check your email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) return;
    setLoading(true);
    try {
      await API.post("/employee/verify-otp", { email, otp });
      setStep("newPassword");
    } catch (err: any) {
      showDialog(err.response?.data?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showDialog("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showDialog("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await API.post("/employee/reset-password", { email, otp, newPassword });
      showDialog("Password reset successfully! You can now login.", true);
      setTimeout(() => router.replace("/employeeLogin"), 2000);
    } catch (err: any) {
      showDialog(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const stepTitles: Record<Step, string> = {
    email: "Forgot Password",
    otp: "Enter OTP",
    newPassword: "Set New Password",
  };

  const stepSubtitles: Record<Step, string> = {
    email: "Enter your employee email to receive an OTP",
    otp: `OTP sent to ${email}. Enter the code below.`,
    newPassword: "Create a strong new password for your account",
  };

  return (
    <View style={styles.outerContainer}>
      <ImageBackground
        source={require("../assets/images/auth_bg.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <View style={styles.scrollContent}>
            <View style={styles.glassWrapper}>
              <View style={styles.logoSection}>
                <Text variant="headlineSmall" style={styles.brandName}>CRM</Text>
              </View>

              {/* Step Progress */}
              <View style={styles.stepIndicator}>
                {(["email", "otp", "newPassword"] as Step[]).map((s, i) => (
                  <View key={s} style={styles.stepRow}>
                    <View style={[
                      styles.stepDot,
                      step === s && styles.stepDotActive,
                      (step === "otp" && i === 0) || (step === "newPassword" && i < 2)
                        ? styles.stepDotDone : {}
                    ]}>
                      <Text style={[
                        styles.stepDotText,
                        (step === s || (step === "otp" && i === 0) || (step === "newPassword" && i < 2))
                          && styles.stepDotTextActive
                      ]}>{i + 1}</Text>
                    </View>
                    {i < 2 && <View style={[styles.stepLine, (step === "otp" && i === 0) || (step === "newPassword" && i < 2) ? styles.stepLineDone : {}]} />}
                  </View>
                ))}
              </View>

              <Card style={styles.card} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>{stepTitles[step]}</Text>
                  <Text variant="bodySmall" style={styles.subtitle}>{stepSubtitles[step]}</Text>

                  {step === "email" && (
                    <>
                      <TextInput
                        label="Employee Email"
                        value={email}
                        onChangeText={setEmail}
                        mode="flat"
                        activeUnderlineColor="#00796B"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        left={<TextInput.Icon icon="email-outline" />}
                        style={styles.input}
                        textColor="#000"
                      />
                      <Button
                        mode="contained"
                        onPress={handleRequestOtp}
                        loading={loading}
                        disabled={loading || !email}
                        style={styles.mainButton}
                        labelStyle={styles.buttonLabel}
                        buttonColor="#00796B"
                        textColor="white"
                      >
                        Send OTP
                      </Button>
                    </>
                  )}

                  {step === "otp" && (
                    <>
                      <TextInput
                        label="One-Time Password (OTP)"
                        value={otp}
                        onChangeText={setOtp}
                        mode="flat"
                        activeUnderlineColor="#00796B"
                        keyboardType="number-pad"
                        left={<TextInput.Icon icon="shield-key-outline" />}
                        style={styles.input}
                        textColor="#000"
                        maxLength={6}
                      />
                      <Button
                        mode="contained"
                        onPress={handleVerifyOtp}
                        loading={loading}
                        disabled={loading || otp.length < 4}
                        style={styles.mainButton}
                        labelStyle={styles.buttonLabel}
                        buttonColor="#00796B"
                        textColor="white"
                      >
                        Verify OTP
                      </Button>
                      <TouchableOpacity onPress={handleRequestOtp} style={styles.resendRow}>
                        <Text style={styles.resendLink}>Resend OTP</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {step === "newPassword" && (
                    <>
                      <TextInput
                        label="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        mode="flat"
                        activeUnderlineColor="#00796B"
                        secureTextEntry
                        left={<TextInput.Icon icon="lock-outline" />}
                        style={styles.input}
                        textColor="#000"
                      />
                      <TextInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        mode="flat"
                        activeUnderlineColor="#00796B"
                        secureTextEntry
                        left={<TextInput.Icon icon="lock-check-outline" />}
                        style={styles.input}
                        textColor="#000"
                      />
                      <Button
                        mode="contained"
                        onPress={handleResetPassword}
                        loading={loading}
                        disabled={loading || !newPassword || !confirmPassword}
                        style={styles.mainButton}
                        labelStyle={styles.buttonLabel}
                        buttonColor="#00796B"
                        textColor="white"
                      >
                        Reset Password
                      </Button>
                    </>
                  )}

                  <View style={styles.footer}>
                    <TouchableOpacity onPress={() => router.replace("/employeeLogin")}>
                      <Text style={styles.link}>← Back to Employee Login</Text>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            </View>

            <Portal>
              <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
                <Dialog.Title style={dialogSuccess ? styles.successTitle : styles.errorTitle}>
                  {dialogSuccess ? "✓ Success" : "Notice"}
                </Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium" style={styles.dialogMsg}>{dialogMsg}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setDialogVisible(false)} textColor="#00796B">OK</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1 },
  background: { width, height },
  flex: { flex: 1 },
  scrollContent: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  glassWrapper: {
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  brandName: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 2,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  stepDotActive: {
    backgroundColor: "#00796B",
    borderColor: "#fff",
  },
  stepDotDone: {
    backgroundColor: "#1B5E20",
    borderColor: "#fff",
  },
  stepDotText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "700",
    fontSize: 13,
  },
  stepDotTextActive: {
    color: "#fff",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: "#1B5E20",
  },
  card: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.97)",
    ...Platform.select({
      web: { boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 12,
      },
    }),
  },
  cardContent: { padding: 16 },
  sectionTitle: {
    textAlign: "center",
    color: "#004D40",
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 24,
    lineHeight: 18,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  mainButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 4,
  },
  buttonLabel: { fontWeight: "700", letterSpacing: 1 },
  resendRow: { alignItems: "center", marginTop: 12 },
  resendLink: { color: "#00796B", fontWeight: "600", fontSize: 13 },
  footer: { alignItems: "center", marginTop: 20 },
  link: { color: "#00796B", fontWeight: "700", fontSize: 13 },
  dialog: { borderRadius: 20, backgroundColor: "#fff" },
  successTitle: { color: "#1B5E20", fontWeight: "bold" },
  errorTitle: { color: "#D32F2F", fontWeight: "bold" },
  dialogMsg: { color: "#444" },
});
