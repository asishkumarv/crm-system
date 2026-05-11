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

export default function AdminForgotPassword() {
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

  const handleRequestOtp = async () => {
    if (!email) return;

    setLoading(true);

    try {
      await API.post(
        "/admin/forgot-password",
        {
          email,
        }
      );

      showDialog(
        "OTP sent to your email. Please check your inbox.",
        true
      );

      setStep("otp");
    } catch (err: any) {
      showDialog(
        err.response?.data?.message ||
          "Failed to send OTP. Check your email address."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) return;

    setLoading(true);

    try {
      await API.post(
        "/admin/verify-reset-otp",
        {
          email,
          otp,
        }
      );

      setStep("newPassword");
    } catch (err: any) {
      showDialog(
        err.response?.data?.message ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
        "/admin/reset-password",
        {
          email,
          otp,
          newPassword,
        }
      );

      showDialog(
        "Password reset successfully! You can now login.",
        true
      );

      setTimeout(
        () => router.replace("/adminLogin"),
        2000
      );
    } catch (err: any) {
      showDialog(
        err.response?.data?.message ||
          "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  const stepTitles: Record<Step, string> = {
    email: "Forgot Password",
    otp: "Verify Code",
    newPassword: "Create New Password",
  };

  const stepSubtitles: Record<
    Step,
    string
  > = {
    email:
      "Enter your admin email to receive a recovery code",

    otp: `Verification code sent to ${email}`,

    newPassword:
      "Establish a secure new password for your account",
  };

  return (
    <View style={styles.outerContainer}>
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
            <View style={styles.logoSection}>
              <Text style={styles.brandName}>
                CRM
              </Text>
            </View>

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

                {step === "email" && (
                  <>
                    <TextInput
                      label="Admin Email"
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

                {step === "otp" && (
                  <>
                    <TextInput
                      label="6-Digit Code"
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
                  </>
                )}

                {step === "newPassword" && (
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
              </Card.Content>
            </Card>
          </View>
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
});