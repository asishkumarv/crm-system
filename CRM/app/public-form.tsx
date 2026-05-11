import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from "react-native";

import {
  TextInput,
  Text,
  ActivityIndicator,
  IconButton,
  Avatar,
} from "react-native-paper";

import API from "../services/api";

export default function PublicLeadForm() {
  const { width } = useWindowDimensions();

  const isMobile = width < 768;
  const isVerySmall = width < 400;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceNeeded: "",
    source: "Instagram",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.serviceNeeded
    ) {
      setError("Required fields are missing");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.post("/leads", {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        query: formData.serviceNeeded,
        source: formData.source,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data ||
          "Submission failed. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const sources = [
    {
      label: "Instagram",
      value: "Instagram",
      icon: "instagram",
      color: "#E1306C",
    },

    {
      label: "Facebook",
      value: "Facebook",
      icon: "facebook",
      color: "#1877F2",
    },

    {
      label: "LinkedIn",
      value: "LinkedIn",
      icon: "linkedin",
      color: "#0A66C2",
    },

    {
      label: "Other",
      value: "Other",
      icon: "dots-horizontal",
      color: "#607D8B",
    },
  ];

  if (success) {
    return (
      <View style={styles.outerContainer}>
        <View style={styles.background}>
          <View style={styles.leftGlow} />
          <View style={styles.rightGlow} />
          <View style={styles.centerGlow} />
        </View>

        <View style={styles.darkOverlay}>
          <View style={styles.successWrapper}>
            <Avatar.Icon
              size={isMobile ? 60 : 80}
              icon="rocket-launch"
              style={{
                backgroundColor: "#22D3EE20",
              }}
              color="#22D3EE"
            />

            <Text
              variant={
                isMobile
                  ? "headlineMedium"
                  : "headlineLarge"
              }
              style={styles.successHeader}
            >
              You're On Board!
            </Text>

            <Text
              style={[
                styles.successSub,

                isMobile && {
                  fontSize: 16,
                  lineHeight: 24,
                },
              ]}
            >
              One of our strategy experts will
              contact you shortly to discuss your
              requirements.
            </Text>

            <TouchableOpacity
              onPress={() => setSuccess(false)}
              style={styles.minimalButton}
            >
              <Text style={styles.minimalButtonText}>
                BACK TO FORM
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" />

      {/* BACKGROUND */}
      <View style={styles.background}>
        <View style={styles.leftGlow} />
        <View style={styles.rightGlow} />
        <View style={styles.centerGlow} />
      </View>

      <View style={styles.darkOverlay}>
        <KeyboardAvoidingView
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
          }
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={
              styles.scrollContainer
            }
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.content,
                {
                  paddingHorizontal: isMobile
                    ? 16
                    : 24,
                },
              ]}
            >
              {/* HERO */}
              <View
                style={[
                  styles.heroSection,

                  {
                    marginTop: isMobile ? 20 : 40,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.kicker,

                    isVerySmall && {
                      fontSize: 10,
                      letterSpacing: 2,
                    },
                  ]}
                >
                  ELEVATE YOUR BUSINESS
                </Text>

                <Text
                  style={[
                    styles.heroTitle,

                    isMobile && {
                      fontSize: 32,
                      lineHeight: 38,
                    },
                  ]}
                >
                  Let's Build Something{" "}
                  <Text style={styles.goldText}>
                    Great
                  </Text>
                </Text>

                <Text
                  style={[
                    styles.heroSub,

                    isMobile && {
                      fontSize: 14,
                      maxWidth: "100%",
                    },
                  ]}
                >
                  Premium consulting and
                  enterprise solutions tailored
                  for your success.
                </Text>
              </View>

              {/* FORM */}
              <View
                style={[
                  styles.formCard,

                  {
                    padding: isMobile ? 20 : 32,
                  },
                ]}
              >
                {error ? (
                  <View style={styles.errorBanner}>
                    <IconButton
                      icon="alert-circle"
                      iconColor="#FF5252"
                      size={20}
                    />

                    <Text style={styles.errorText}>
                      {error}
                    </Text>
                  </View>
                ) : null}

                {/* NAME */}
                <View style={styles.inputWrapper}>
                  <IconButton
                    icon="account-tie"
                    iconColor="#22D3EE"
                    size={24}
                    style={styles.inputIcon}
                  />

                  <TextInput
                    placeholder="Your Full Name"
                    value={formData.name}
                    onChangeText={(t) =>
                      setFormData({
                        ...formData,
                        name: t,
                      })
                    }
                    style={styles.premiumInput}
                    textColor="#FFFFFF"
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* EMAIL + PHONE */}
                <View
                  style={[
                    styles.inputRow,

                    isMobile && {
                      flexDirection: "column",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.inputWrapper,

                      {
                        flex: isMobile ? 0 : 1,
                        marginRight: isMobile
                          ? 0
                          : 10,
                      },
                    ]}
                  >
                    <IconButton
                      icon="email-seal"
                      iconColor="#22D3EE"
                      size={20}
                      style={styles.inputIcon}
                    />

                    <TextInput
                      placeholder="Email Address"
                      value={formData.email}
                      onChangeText={(t) =>
                        setFormData({
                          ...formData,
                          email: t,
                        })
                      }
                      style={styles.premiumInput}
                      textColor="#FFFFFF"
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <View
                    style={[
                      styles.inputWrapper,

                      {
                        flex: isMobile ? 0 : 1,
                      },
                    ]}
                  >
                    <IconButton
                      icon="phone-classic"
                      iconColor="#22D3EE"
                      size={20}
                      style={styles.inputIcon}
                    />

                    <TextInput
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChangeText={(t) =>
                        setFormData({
                          ...formData,
                          phone: t,
                        })
                      }
                      style={styles.premiumInput}
                      textColor="#FFFFFF"
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                {/* MESSAGE */}
                <View
                  style={[
                    styles.inputWrapper,

                    {
                      alignItems: "flex-start",
                      height: isMobile
                        ? 100
                        : 120,
                    },
                  ]}
                >
                  <IconButton
                    icon="comment-quote"
                    iconColor="#22D3EE"
                    size={24}
                    style={[
                      styles.inputIcon,
                      {
                        marginTop: 12,
                      },
                    ]}
                  />

                  <TextInput
                    placeholder="About your project..."
                    value={formData.serviceNeeded}
                    onChangeText={(t) =>
                      setFormData({
                        ...formData,
                        serviceNeeded: t,
                      })
                    }
                    multiline
                    style={[
                      styles.premiumInput,
                      {
                        height: isMobile
                          ? 80
                          : 100,
                        paddingTop: 16,
                      },
                    ]}
                    textColor="#FFFFFF"
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* SOURCES */}
                <Text style={styles.sourceLabel}>
                  WHERE DID YOU HEAR ABOUT US?
                </Text>

                <View style={styles.sourceGrid}>
                  {sources.map((s) => (
                    <TouchableOpacity
                      key={s.value}
                      onPress={() =>
                        setFormData({
                          ...formData,
                          source: s.value,
                        })
                      }
                      style={[
                        styles.sourceItem,

                        {
                          width: isMobile
                            ? "100%"
                            : "48%",
                        },

                        formData.source ===
                          s.value && {
                          borderColor: s.color,
                          backgroundColor:
                            s.color + "12",
                        },
                      ]}
                    >
                      <IconButton
                        icon={s.icon}
                        iconColor={
                          formData.source ===
                          s.value
                            ? s.color
                            : "#94A3B8"
                        }
                        size={24}
                      />

                      <Text
                        style={[
                          styles.sourceText,

                          formData.source ===
                            s.value && {
                            color: s.color,
                            fontWeight: "800",
                          },
                        ]}
                      >
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* BUTTON */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={styles.ctaButton}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View
                      style={styles.buttonInner}
                    >
                      <Text
                        style={[
                          styles.ctaText,

                          isVerySmall && {
                            fontSize: 14,
                          },
                        ]}
                      >
                        BOOK A CONSULTATION
                      </Text>

                      <IconButton
                        icon="arrow-right"
                        iconColor="white"
                        size={20}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* FOOTER */}
              <View style={styles.footer}>
                <Text
                  style={[
                    styles.footerText,

                    isVerySmall && {
                      fontSize: 8,
                    },
                  ]}
                >
                  TRUSTED BY FORTUNE 500
                  COMPANIES
                </Text>

                <View style={styles.trustLine} />

                <Text style={styles.footerCopy}>
                  © 2026 CRM-System.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
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
    width: 350,
    height: 350,
    borderRadius: 350,
    backgroundColor: "rgba(34,211,238,0.18)",
    left: -100,
    top: 100,

    ...Platform.select({
      web: {
        filter: "blur(90px)",
      },
    }),
  },

  rightGlow: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 350,
    backgroundColor: "rgba(236,72,153,0.18)",
    right: -120,
    bottom: 80,

    ...Platform.select({
      web: {
        filter: "blur(100px)",
      },
    }),
  },

  centerGlow: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: 600,
    backgroundColor: "rgba(99,102,241,0.08)",
    alignSelf: "center",
    top: 180,

    ...Platform.select({
      web: {
        filter: "blur(140px)",
      },
    }),
  },

  darkOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.65)",
  },

  flex: {
    flex: 1,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  content: {
    alignItems: "center",
  },

  heroSection: {
    marginBottom: 40,
    alignItems: "center",
    width: "100%",
  },

  kicker: {
    color: "#22D3EE",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 4,
    marginBottom: 12,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 48,
    letterSpacing: -1,
  },

  goldText: {
    color: "#A855F7",
  },

  heroSub: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    maxWidth: 340,
    lineHeight: 24,
  },

  formCard: {
    width: "100%",
    maxWidth: 700,
    backgroundColor:
      "rgba(15,23,42,0.88)",
    borderRadius: 34,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",

    ...Platform.select({
      web: {
        backdropFilter: "blur(18px)",
        boxShadow:
          "0px 0px 60px rgba(0,0,0,0.45)",
      },

      default: {
        elevation: 15,
      },
    }),
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(255,82,82,0.08)",
    borderRadius: 12,
    marginBottom: 24,
    paddingRight: 12,
  },

  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.04)",
    borderRadius: 18,
    marginBottom: 16,
    minHeight: 56,
    paddingHorizontal: 8,
  },

  inputIcon: {
    margin: 0,
  },

  premiumInput: {
    flex: 1,
    backgroundColor: "transparent",
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  inputRow: {
    flexDirection: "row",
    width: "100%",
  },

  sourceLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1.5,
    marginTop: 12,
    marginBottom: 16,
    textAlign: "center",
  },

  sourceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
    justifyContent: "space-between",
  },

  sourceItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor:
      "rgba(255,255,255,0.08)",
    borderRadius: 18,
    paddingRight: 12,
    marginBottom: 4,
    backgroundColor:
      "rgba(255,255,255,0.03)",
  },

  sourceText: {
    fontSize: 13,
    color: "#CBD5E1",
    fontWeight: "600",
  },

  ctaButton: {
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",

    ...Platform.select({
      web: {
        backgroundImage:
          "linear-gradient(90deg,#22D3EE 0%, #A855F7 50%, #F43F5E 100%)",
        boxShadow:
          "0 10px 25px rgba(168,85,247,0.35)",
      },

      default: {
        backgroundColor: "#7C3AED",
      },
    }),
  },

  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
  },

  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  footer: {
    marginTop: 40,
    alignItems: "center",
  },

  footerText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
  },

  trustLine: {
    width: 40,
    height: 2,
    backgroundColor: "#22D3EE",
    marginVertical: 16,
  },

  footerCopy: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
  },

  successWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },

  successHeader: {
    color: "#FFFFFF",
    fontWeight: "900",
    marginTop: 24,
    textAlign: "center",
  },

  successSub: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 16,
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 320,
  },

  minimalButton: {
    marginTop: 40,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#22D3EE",
  },

  minimalButtonText: {
    color: "#22D3EE",
    fontWeight: "900",
    letterSpacing: 2,
  },
});