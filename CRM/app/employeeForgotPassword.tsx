import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
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

  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const showDialog = (msg: string, success = false) => {
    setDialogMsg(msg);
    setDialogSuccess(success);
    setDialogVisible(true);
  };

  // Step 1: Request OTP
  const handleRequestOtp = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await API.post("/employee/forgot-password", { email });
      showDialog("OTP verification code sent to your email.", true);
      setStep("otp");
    } catch (err: any) {
      showDialog(err.response?.data?.message || "Failed to initiate password recovery.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) return;
    setLoading(true);
    try {
      await API.post("/employee/verify-otp", { email, otp });
      setStep("newPassword");
    } catch (err: any) {
      showDialog(err.response?.data?.message || "Verification code is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
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
      showDialog("Password reset successful! You can now access your workspace.", true);
      setTimeout(() => router.replace("/employeeLogin"), 2000);
    } catch (err: any) {
      showDialog(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const stepTitles: Record<Step, string> = {
    email: "Employee Recovery",
    otp: "Verify Access",
    newPassword: "New Credentials",
  };

  const stepSubtitles: Record<Step, string> = {
    email: "Enter your workspace email to receive a recovery code",
    otp: `Code sent to ${email}`,
    newPassword: "Establish a secure new password for your employee account",
  };

  return (
    <View style={styles.outerContainer}>
      <ImageBackground
        source={require("../assets/images/auth_bg.png")}
        style={[styles.background, { width, height }]}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView 
            contentContainerStyle={[
              styles.scrollContent, 
              { paddingHorizontal: isDesktop ? width * 0.1 : 24 }
            ]}
            centerContent={true}
          >
            <View style={[styles.glassWrapper, { maxWidth: isDesktop ? 450 : isTablet ? 400 : '100%' }]}>
              {/* Logo */}
              <View style={styles.logoSection}>
                <Text variant="displaySmall" style={styles.brandName}>CRM</Text>
              </View>

              {/* Step Progress Indicator */}
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
                  <Text variant="titleLarge" style={styles.sectionTitle}>{stepTitles[step]}</Text>
                  <Text variant="bodyMedium" style={styles.subtitle}>{stepSubtitles[step]}</Text>

                  {step === "email" && (
                    <>
                      <TextInput
                        label="Work Email"
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
                        Send Code
                      </Button>
                    </>
                  )}

                  {step === "otp" && (
                    <>
                      <TextInput
                        label="6-Digit Verification Code"
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
                        Verify Code
                      </Button>
                      <TouchableOpacity onPress={handleRequestOtp} style={styles.resendRow}>
                        <Text style={styles.resendLink}>Resend Recovery Code</Text>
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
                        label="Confirm New Password"
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
                        Update Password
                      </Button>
                    </>
                  )}

                  <View style={styles.footer}>
                    <TouchableOpacity onPress={() => router.replace("/employeeLogin")}>
                      <Text style={styles.link}>← Return to Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            </View>

            <Portal>
              <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
                <Dialog.Title style={dialogSuccess ? styles.successTitle : styles.errorTitle}>
                  {dialogSuccess ? "✓ Successful" : "Access Recovery"}
                </Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium" style={styles.dialogMsg}>{dialogMsg}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setDialogVisible(false)} textColor="#00796B">DISMISS</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1 },
  background: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  glassWrapper: {
    width: "100%",
    alignSelf: "center",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  brandName: {
    color: "#fff",
    fontWeight: "900",
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  stepDotActive: {
    backgroundColor: "#00796B",
    borderColor: "#fff",
  },
  stepDotDone: {
    backgroundColor: "#00897B",
    borderColor: "#fff",
  },
  stepDotText: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "800",
    fontSize: 14,
  },
  stepDotTextActive: {
    color: "#fff",
  },
  stepLine: {
    width: 50,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: "#00897B",
  },
  card: {
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.98)",
    ...Platform.select({
      web: { boxShadow: "0px 20px 40px rgba(0,0,0,0.25)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 12,
      },
    }),
  },
  cardContent: { padding: 24 },
  sectionTitle: {
    textAlign: "center",
    color: "#004D40",
    fontWeight: "800",
    marginBottom: 12,
  },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 32,
    lineHeight: 20,
    fontSize: 14,
  },
  input: {
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  mainButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 6,
  },
  buttonLabel: { fontWeight: "800", letterSpacing: 1.5, fontSize: 16 },
  resendRow: { alignItems: "center", marginTop: 20 },
  resendLink: { color: "#00796B", fontWeight: "700", fontSize: 14 },
  footer: { alignItems: "center", marginTop: 32 },
  link: { color: "#00796B", fontWeight: "800", fontSize: 14 },
  dialog: { borderRadius: 28, backgroundColor: "#fff" },
  successTitle: { color: "#1B5E20", fontWeight: "900" },
  errorTitle: { color: "#D32F2F", fontWeight: "900" },
  dialogMsg: { color: "#444", lineHeight: 22 },
});
