import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";

import {
  TextInput,
  Button,
  Text,
  Card,
  Portal,
  Dialog,
  SegmentedButtons,
} from "react-native-paper";

import { router } from "expo-router";
import API from "../services/api";

export default function Register() {
  const { width } = useWindowDimensions();

  const [role, setRole] = useState("employee");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const hideDialog = () => setVisible(false);

  const register = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Please complete all required fields to proceed.");
      setVisible(true);
      return;
    }

    setLoading(true);

    try {
      if (role === "employee") {
        await API.post("/employee/register", form);

        alert(
          "Registration Successful! Your account is pending admin approval."
        );

        router.push("/employeeLogin");
      } else {
        await API.post("/admin/register", form);

        setShowOTP(true);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "We encountered an error during registration. Please try again."
      );

      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) return;

    setLoading(true);

    try {
      await API.post("/admin/verify-otp", {
        email: form.email,
        otp,
      });

      alert(
        "Verification successful! You can now log in as an administrator."
      );

      router.push("/adminLogin");
    } catch (err) {
      setError(
        "The OTP entered is incorrect. Please request a new one if needed."
      );

      setVisible(true);
    } finally {
      setLoading(false);
    }
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.glassWrapper,
              {
                maxWidth: isDesktop
                  ? 520
                  : isTablet
                  ? 470
                  : "100%",
              },
            ]}
          >
            {/* LOGO */}
            <View style={styles.logoSection}>
              <Text style={styles.brandName}>CRM</Text>

              <Text style={styles.brandTagline}>
                JOIN THE ENTERPRISE ECOSYSTEM
              </Text>
            </View>

            {/* CARD */}
            <Card style={styles.card} mode="elevated">
              <Card.Content style={styles.cardContent}>
                {/* TABS */}
                <View style={styles.topTabs}>
                  <Text style={styles.activeTab}>Sign Up</Text>
                
                </View>

                <View style={styles.activeLine} />

                {/* TITLE */}
                <Text style={styles.sectionTitle}>
                  Create Account
                </Text>

                {/* ROLE SELECT */}
                <SegmentedButtons
                  value={role}
                  onValueChange={setRole}
                  style={styles.segmented}
                  theme={{
                    colors: {
                      secondaryContainer:
                        "rgba(34,211,238,0.18)",
                      onSecondaryContainer: "#22D3EE",
                    },
                  }}
                  buttons={[
                    {
                      value: "employee",
                      label: "Employee",
                      icon: "account-tie",
                    },

                    {
                      value: "admin",
                      label: "Admin",
                      icon: "shield-crown",
                    },
                  ]}
                />

                {/* NAME */}
                <TextInput
                  label="Full Name"
                  value={form.name}
                  onChangeText={(t) =>
                    setForm({ ...form, name: t })
                  }
                  mode="flat"
                  activeUnderlineColor="transparent"
                  underlineColor="transparent"
                  autoComplete="name"
                  textContentType="name"
                  left={
                    <TextInput.Icon
                      icon="account-outline"
                      color="#94A3B8"
                    />
                  }
                  style={styles.input}
                  textColor="#fff"
                  theme={{
                    colors: {
                      text: "#fff",
                      placeholder: "#94A3B8",
                      primary: "#22D3EE",
                      background: "transparent",
                    },
                  }}
                />

                {/* EMAIL */}
                <TextInput
                  label="Business Email"
                  value={form.email}
                  onChangeText={(t) =>
                    setForm({ ...form, email: t })
                  }
                  mode="flat"
                  activeUnderlineColor="transparent"
                  underlineColor="transparent"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  left={
                    <TextInput.Icon
                      icon="email-outline"
                      color="#94A3B8"
                    />
                  }
                  style={styles.input}
                  textColor="#fff"
                  theme={{
                    colors: {
                      text: "#fff",
                      placeholder: "#94A3B8",
                      primary: "#22D3EE",
                      background: "transparent",
                    },
                  }}
                />

                {/* PASSWORD */}
                <TextInput
                  label="Secure Password"
                  value={form.password}
                  onChangeText={(t) =>
                    setForm({ ...form, password: t })
                  }
                  mode="flat"
                  activeUnderlineColor="transparent"
                  underlineColor="transparent"
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
                  left={
                    <TextInput.Icon
                      icon="lock-outline"
                      color="#94A3B8"
                    />
                  }
                  style={styles.input}
                  textColor="#fff"
                  theme={{
                    colors: {
                      text: "#fff",
                      placeholder: "#94A3B8",
                      primary: "#A855F7",
                      background: "transparent",
                    },
                  }}
                />

                {/* BUTTON */}
                <Button
                  mode="contained"
                  onPress={register}
                  loading={loading}
                  disabled={loading}
                  style={styles.mainButton}
                  labelStyle={styles.buttonLabel}
                  buttonColor="transparent"
                  textColor="white"
                >
                  {showOTP
                    ? "RESEND CODE"
                    : "CREATE ACCOUNT"}
                </Button>

                {/* DIVIDER */}
                <View style={styles.divider}>
                  <View style={styles.line} />

                  <Text style={styles.dividerText}>
                    OR
                  </Text>

                  <View style={styles.line} />
                </View>

                {/* FOOTER */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Already registered?
                  </Text>

                  <View style={styles.linkRow}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push("/adminLogin")
                      }
                    >
                      <Text style={styles.link}>
                        Admin Access
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.dot}>•</Text>

                    <TouchableOpacity
                      onPress={() =>
                        router.push("/employeeLogin")
                      }
                    >
                      <Text style={styles.link}>
                        Employee Workspace
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>

          {/* OTP DIALOG */}
          <Portal>
            <Dialog
              visible={showOTP}
              onDismiss={() => setShowOTP(false)}
              style={styles.dialog}
            >
              <Dialog.Title style={styles.dialogTitle}>
                Email Verification
              </Dialog.Title>

              <Dialog.Content>
                <Text style={styles.dialogMsg}>
                  For security, please enter the
                  6-digit code sent to:
                  {"\n"}
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {form.email}
                  </Text>
                </Text>

                <TextInput
                  placeholder="Enter Code"
                  value={otp}
                  onChangeText={setOtp}
                  mode="flat"
                  keyboardType="numeric"
                  maxLength={6}
                  style={styles.otpInput}
                  textAlign="center"
                  textColor="#fff"
                  activeUnderlineColor="transparent"
                  underlineColor="transparent"
                  theme={{
                    colors: {
                      text: "#fff",
                      placeholder: "#94A3B8",
                      primary: "#22D3EE",
                      background: "transparent",
                    },
                  }}
                />
              </Dialog.Content>

              <Dialog.Actions>
                <Button
                  onPress={() => setShowOTP(false)}
                  textColor="#94A3B8"
                >
                  CANCEL
                </Button>

                <Button
                  mode="contained"
                  loading={loading}
                  onPress={verifyOTP}
                  buttonColor="#7C3AED"
                  textColor="white"
                >
                  VERIFY
                </Button>
              </Dialog.Actions>
            </Dialog>

            {/* ERROR DIALOG */}
            <Dialog
              visible={visible}
              onDismiss={hideDialog}
              style={styles.dialog}
            >
              <Dialog.Title style={styles.errorTitle}>
                Notification
              </Dialog.Title>

              <Dialog.Content>
                <Text style={styles.errorMsg}>
                  {error}
                </Text>
              </Dialog.Content>

              <Dialog.Actions>
                <Button
                  onPress={hideDialog}
                  mode="text"
                  textColor="#22D3EE"
                >
                  UNDERSTOOD
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
    overflow: "hidden",
  },

  leftGlow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: "rgba(34,211,238,0.18)",
    left: -80,
    top: 100,

    ...Platform.select({
      web: {
        filter: "blur(80px)",
      },
    }),
  },

  rightGlow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: "rgba(236,72,153,0.18)",
    right: -100,
    bottom: 100,

    ...Platform.select({
      web: {
        filter: "blur(90px)",
      },
    }),
  },

  centerGlow: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 500,
    backgroundColor: "rgba(99,102,241,0.08)",
    alignSelf: "center",
    top: 180,

    ...Platform.select({
      web: {
        filter: "blur(120px)",
      },
    }),
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: 60,
    paddingBottom: 60,
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

  brandTagline: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 6,
    fontWeight: "600",
  },

  card: {
    borderRadius: 34,
    overflow: "hidden",
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",

    ...Platform.select({
      web: {
        backdropFilter: "blur(18px)",
        boxShadow: "0px 0px 60px rgba(0,0,0,0.45)",
      },

      default: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 12,
        },
        shadowOpacity: 0.4,
        shadowRadius: 25,
        elevation: 15,
      },
    }),
  },

  cardContent: {
    paddingHorizontal: 34,
    paddingVertical: 38,
  },

  topTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },

  activeTab: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },

  inactiveTab: {
    color: "rgba(255,255,255,0.35)",
    fontWeight: "600",
    fontSize: 16,
  },

  activeLine: {
    height: 2,
    width: 120,
    backgroundColor: "#22D3EE",
    borderRadius: 20,
    marginBottom: 40,
    marginLeft: 10,
  },

  sectionTitle: {
    textAlign: "center",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 34,
    marginBottom: 34,
  },

  segmented: {
    marginBottom: 28,
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  input: {
    marginBottom: 22,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    overflow: "hidden",
    height: 58,
  },

  mainButton: {
    marginTop: 14,
    borderRadius: 18,
    paddingVertical: 8,

    ...Platform.select({
      web: {
        backgroundImage:
          "linear-gradient(90deg,#22D3EE 0%, #A855F7 50%, #F43F5E 100%)",
      },

      default: {
        backgroundColor: "#7C3AED",
      },
    }),
  },

  buttonLabel: {
    fontWeight: "800",
    letterSpacing: 1,
    fontSize: 16,
    color: "#ffffff",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  dividerText: {
    marginHorizontal: 16,
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    fontWeight: "800",
  },

  footer: {
    alignItems: "center",
  },

  footerText: {
    color: "rgba(255,255,255,0.6)",
    marginBottom: 12,
    fontWeight: "500",
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  link: {
    color: "#22D3EE",
    fontWeight: "800",
    fontSize: 14,
  },

  dot: {
    marginHorizontal: 12,
    color: "rgba(255,255,255,0.25)",
    fontSize: 18,
  },

  dialog: {
    borderRadius: 28,
    backgroundColor: "#111827",
  },

  dialogTitle: {
    textAlign: "center",
    color: "#22D3EE",
    fontWeight: "900",
  },

  dialogMsg: {
    textAlign: "center",
    lineHeight: 24,
    color: "#d1d5db",
  },

  otpInput: {
    marginTop: 24,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    overflow: "hidden",
  },

  errorTitle: {
    color: "#ff6b6b",
    fontWeight: "bold",
  },

  errorMsg: {
    color: "#d1d5db",
  },
});