import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  const [dialogMsg, setDialogMsg] =
    useState("");

  const [dialogVisible, setDialogVisible] =
    useState(false);

  const [dialogSuccess, setDialogSuccess] =
    useState(false);

  const { width } = useWindowDimensions();

  const isDesktop = width >= 1024;

  const isTablet =
    width >= 768 && width < 1024;

  const showDialog = (
    msg: string,
    success = false
  ) => {
    setDialogMsg(msg);
    setDialogSuccess(success);
    setDialogVisible(true);
  };

  // STEP 1
  const handleRequestOtp = async () => {
    if (!email) return;

    setLoading(true);

    try {
      await API.post(
        "/employee/forgot-password",
        {
          email,
        }
      );

      showDialog(
        "OTP verification code sent to your email.",
        true
      );

      setStep("otp");
    } catch (err: any) {
      showDialog(
        err.response?.data?.message ||
          "Failed to initiate password recovery."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) return;

    setLoading(true);

    try {
      await API.post(
        "/employee/verify-otp",
        {
          email,
          otp,
        }
      );

      setStep("newPassword");
    } catch (err: any) {
      showDialog(
        err.response?.data?.message ||
          "Verification code is invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 3
  const handleResetPassword = async () => {
    if (
      !newPassword ||
      newPassword.length < 6
    ) {
      showDialog(
        "Password must be at least 6 characters."
      );

      return;
    }

    if (newPassword !== confirmPassword) {
      showDialog("Passwords do not match.");

      return;
    }

    setLoading(true);

    try {
      await API.post(
        "/employee/reset-password",
        {
          email,
          otp,
          newPassword,
        }
      );

      showDialog(
        "Password reset successful! You can now access your workspace.",
        true
      );

      setTimeout(
        () =>
          router.replace("/employeeLogin"),
        2000
      );
    } catch (err: any) {
      showDialog(
        err.response?.data?.message ||
          "Failed to update password."
      );
    } finally {
      setLoading(false);
    }
  };

  const stepTitles: Record<Step, string> = {
    email: "Employee Recovery",
    otp: "Verify Access",
    newPassword: "New Credentials",
  };

  const stepSubtitles: Record<
    Step,
    string
  > = {
    email:
      "Enter your workspace email to receive a recovery code",

    otp: `Code sent to ${email}`,

    newPassword:
      "Establish a secure new password for your employee account",
  };

  return (
    <View style={styles.outerContainer}>
      {/* BACKGROUND */}
      <View style={styles.background}>
        <View style={styles.leftGlow} />

        <View style={styles.rightGlow} />

        <View style={styles.centerGlow} />
      </View>

      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal:
                isDesktop
                  ? width * 0.1
                  : 24,
            },
          ]}
          centerContent={true}
        >
          <View
            style={[
              styles.glassWrapper,
              {
                maxWidth: isDesktop
                  ? 480
                  : isTablet
                  ? 430
                  : "100%",
              },
            ]}
          >
            {/* LOGO */}
            <View style={styles.logoSection}>
              <Text style={styles.brandName}>
                CRM
              </Text>
            </View>

            {/* CARD */}
            <Card style={styles.card}>
              <Card.Content
                style={styles.cardContent}
              >
                <Text style={styles.sectionTitle}>
                  {stepTitles[step]}
                </Text>

                <Text style={styles.subtitle}>
                  {stepSubtitles[step]}
                </Text>

                {/* EMAIL STEP */}
                {step === "email" && (
                  <>
                    <TextInput
                      label="Work Email"
                      value={email}
                      onChangeText={setEmail}
                      mode="flat"
                      activeUnderlineColor="transparent"
                      underlineColor="transparent"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      left={
                        <TextInput.Icon
                          icon="email-outline"
                          color="#94A3B8"
                        />
                      }
                      style={styles.input}
                      textColor="#fff"
                    />

                    <Button
                      mode="contained"
                      onPress={
                        handleRequestOtp
                      }
                      loading={loading}
                      disabled={
                        loading || !email
                      }
                      style={
                        styles.mainButton
                      }
                      labelStyle={
                        styles.buttonLabel
                      }
                      buttonColor="transparent"
                    >
                      Send Code
                    </Button>
                  </>
                )}

                {/* OTP STEP */}
                {step === "otp" && (
                  <>
                    <TextInput
                      label="6-Digit Verification Code"
                      value={otp}
                      onChangeText={setOtp}
                      mode="flat"
                      activeUnderlineColor="transparent"
                      underlineColor="transparent"
                      keyboardType="number-pad"
                      left={
                        <TextInput.Icon
                          icon="shield-key-outline"
                          color="#94A3B8"
                        />
                      }
                      style={styles.input}
                      textColor="#fff"
                      maxLength={6}
                    />

                    <Button
                      mode="contained"
                      onPress={
                        handleVerifyOtp
                      }
                      loading={loading}
                      disabled={
                        loading ||
                        otp.length < 4
                      }
                      style={
                        styles.mainButton
                      }
                      labelStyle={
                        styles.buttonLabel
                      }
                      buttonColor="transparent"
                    >
                      Verify Code
                    </Button>

                    <TouchableOpacity
                      onPress={
                        handleRequestOtp
                      }
                      style={styles.resendRow}
                    >
                      <Text
                        style={
                          styles.resendLink
                        }
                      >
                        Resend Recovery Code
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* PASSWORD STEP */}
                {step ===
                  "newPassword" && (
                  <>
                    <TextInput
                      label="New Password"
                      value={newPassword}
                      onChangeText={
                        setNewPassword
                      }
                      mode="flat"
                      activeUnderlineColor="transparent"
                      underlineColor="transparent"
                      secureTextEntry
                      left={
                        <TextInput.Icon
                          icon="lock-outline"
                          color="#94A3B8"
                        />
                      }
                      style={styles.input}
                      textColor="#fff"
                    />

                    <TextInput
                      label="Confirm New Password"
                      value={
                        confirmPassword
                      }
                      onChangeText={
                        setConfirmPassword
                      }
                      mode="flat"
                      activeUnderlineColor="transparent"
                      underlineColor="transparent"
                      secureTextEntry
                      left={
                        <TextInput.Icon
                          icon="lock-check-outline"
                          color="#94A3B8"
                        />
                      }
                      style={styles.input}
                      textColor="#fff"
                    />

                    <Button
                      mode="contained"
                      onPress={
                        handleResetPassword
                      }
                      loading={loading}
                      disabled={
                        loading ||
                        !newPassword ||
                        !confirmPassword
                      }
                      style={
                        styles.mainButton
                      }
                      labelStyle={
                        styles.buttonLabel
                      }
                      buttonColor="transparent"
                    >
                      Update Password
                    </Button>
                  </>
                )}

                {/* FOOTER */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    onPress={() =>
                      router.replace(
                        "/employeeLogin"
                      )
                    }
                  >
                    <Text style={styles.link}>
                      ← Return to Sign In
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          </View>

          {/* DIALOG */}
          <Portal>
            <Dialog
              visible={dialogVisible}
              onDismiss={() =>
                setDialogVisible(false)
              }
              style={styles.dialog}
            >
              <Dialog.Title
                style={
                  dialogSuccess
                    ? styles.successTitle
                    : styles.errorTitle
                }
              >
                {dialogSuccess
                  ? "✓ Successful"
                  : "Access Recovery"}
              </Dialog.Title>

              <Dialog.Content>
                <Text style={styles.dialogMsg}>
                  {dialogMsg}
                </Text>
              </Dialog.Content>

              <Dialog.Actions>
                <Button
                  onPress={() =>
                    setDialogVisible(false)
                  }
                  textColor="#22D3EE"
                >
                  DISMISS
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#020617",
  },

  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#020617",
  },

  leftGlow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor:
      "rgba(34,211,238,0.18)",
    left: -80,
    top: 100,
  },

  rightGlow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor:
      "rgba(236,72,153,0.18)",
    right: -100,
    bottom: 100,
  },

  centerGlow: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 500,
    backgroundColor:
      "rgba(99,102,241,0.08)",
    alignSelf: "center",
    top: 180,
  },

  flex: {
    flex: 1,
  },

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
    marginBottom: 28,
  },

  brandName: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 3,
  },

  card: {
    borderRadius: 34,
    overflow: "hidden",
    backgroundColor:
      "rgba(15, 23, 42, 0.88)",
  },

  cardContent: {
    paddingHorizontal: 34,
    paddingVertical: 38,
  },

  sectionTitle: {
    textAlign: "center",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 32,
    marginBottom: 12,
  },

  subtitle: {
    textAlign: "center",
    color:
      "rgba(255,255,255,0.6)",
    marginBottom: 32,
  },

  input: {
    marginBottom: 22,
    backgroundColor:
      "rgba(255,255,255,0.04)",
    borderRadius: 18,
    overflow: "hidden",
    height: 58,
  },

  mainButton: {
    marginTop: 14,
    borderRadius: 18,
    paddingVertical: 8,
    backgroundColor: "#7C3AED",
  },

  buttonLabel: {
    fontWeight: "800",
    letterSpacing: 1,
    fontSize: 16,
    color: "#ffffff",
  },

  resendRow: {
    alignItems: "center",
    marginTop: 20,
  },

  resendLink: {
    color: "#22D3EE",
    fontWeight: "700",
    fontSize: 14,
  },

  footer: {
    alignItems: "center",
    marginTop: 32,
  },

  link: {
    color: "#22D3EE",
    fontWeight: "800",
    fontSize: 14,
  },

  dialog: {
    borderRadius: 28,
    backgroundColor: "#111827",
  },

  successTitle: {
    color: "#22D3EE",
    fontWeight: "900",
  },

  errorTitle: {
    color: "#FF6B6B",
    fontWeight: "900",
  },

  dialogMsg: {
    color: "#d1d5db",
    lineHeight: 22,
  },
});