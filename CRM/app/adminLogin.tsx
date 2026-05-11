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
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function AdminLogin() {
  const { login: setAuth } = useAuth();
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const login = async () => {
    if (!email || !password) return;

    setLoading(true);

    try {
      const res = await API.post("/admin/login", {
        email,
        password,
      });

      if (Platform.OS === "web") {
        (document.activeElement as HTMLElement)?.blur();
      }

      setAuth({ email, role: "admin" }, res.data.token);

      router.push("/(tabs)/adminDashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please check your admin credentials."
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
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: isDesktop ? width * 0.1 : 24,
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
            {/* LOGO SECTION */}
            <View style={styles.logoSection}>
              <Text style={styles.brandName}>CRM</Text>

              <Text style={styles.brandTagline}>
                ADMINISTRATOR PORTAL
              </Text>
            </View>

            {/* LOGIN CARD */}
            <Card style={styles.card} mode="elevated">
              <Card.Content style={styles.cardContent}>
                <View style={styles.topTabs}>
                  <Text style={styles.activeTab}>Login</Text>
                  
                </View>

                <View style={styles.activeLine} />

                <Text style={styles.sectionTitle}>
                  Welcome Back
                </Text>

                {/* EMAIL */}
                <TextInput
                  label="Admin Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="flat"
                  activeUnderlineColor="transparent"
                  underlineColor="transparent"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  left={
                    <TextInput.Icon
                      icon="shield-account-outline"
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
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="flat"
                  activeUnderlineColor="transparent"
                  underlineColor="transparent"
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
                  left={
                    <TextInput.Icon
                      icon="key-outline"
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
                  onPress={login}
                  loading={loading}
                  disabled={loading}
                  style={styles.mainButton}
                  labelStyle={styles.buttonLabel}
                  buttonColor="transparent"
                  textColor="white"
                >
                  Continue
                </Button>

                {/* FOOTER */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push("/adminForgotPassword")
                    }
                  >
                    <Text style={styles.link}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/register")}
                    style={{ marginTop: 16 }}
                  >
                    <Text style={styles.link}>
                      New admin? Register here.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      router.replace("/employeeLogin")
                    }
                    style={{ marginTop: 16 }}
                  >
                    <Text
                      style={[
                        styles.link,
                        {
                          color: "#22D3EE",
                        },
                      ]}
                    >
                      Switch to Employee Login
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          </View>

          {/* ERROR DIALOG */}
          <Portal>
            <Dialog
              visible={visible}
              onDismiss={() => setVisible(false)}
              style={styles.dialog}
            >
              <Dialog.Title style={styles.errorTitle}>
                Security Notice
              </Dialog.Title>

              <Dialog.Content>
                <Text style={styles.errorMsg}>
                  {error}
                </Text>
              </Dialog.Content>

              <Dialog.Actions>
                <Button
                  onPress={() => setVisible(false)}
                  textColor="#22D3EE"
                >
                  RETRY
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
    alignItems: "center",
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

  footer: {
    alignItems: "center",
    marginTop: 28,
  },

  link: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    fontSize: 14,
  },

  dialog: {
    borderRadius: 24,
    backgroundColor: "#111827",
  },

  errorTitle: {
    color: "#ff6b6b",
    fontWeight: "bold",
  },

  errorMsg: {
    color: "#d1d5db",
  },
});