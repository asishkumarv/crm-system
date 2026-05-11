import React from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";

import {
  Text,
  Card,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";

import { router, Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { user, token, isLoading } = useAuth();

  const { width } = useWindowDimensions();

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  if (!isLoading && token && user) {
    if (user.role === "admin") {
      return <Redirect href="/(tabs)/adminDashboard" />;
    }

    if (user.role === "employee") {
      return <Redirect href="/(tabs)/employeeDashboard" />;
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#22D3EE"
        />
      </View>
    );
  }

  const options = [
    {
      title: "New Registration",
      subtitle:
        "Establish your corporate profile and join the CRM ecosystem.",
      icon: "account-plus-outline",
      route: "/register",
      color: "#22D3EE",
    },

    {
      title: "Admin Portal",
      subtitle:
        "Secure access for system administrators and managers.",
      icon: "shield-account-outline",
      route: "/adminLogin",
      color: "#A855F7",
    },

    {
      title: "Employee Hub",
      subtitle:
        "Dedicated workspace for lead processing and operations.",
      icon: "briefcase-variant-outline",
      route: "/employeeLogin",
      color: "#06B6D4",
    },

    {
      title: "Public Inquiry",
      subtitle:
        "Submit your service request and get a premium consultation.",
      icon: "message-draw",
      route: "/public-form",
      color: "#F43F5E",
    },
  ];

  return (
    <View style={styles.container}>
      {/* BACKGROUND */}
      <View style={styles.background}>
        <View style={styles.leftGlow} />
        <View style={styles.rightGlow} />
        <View style={styles.centerGlow} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.brandName}>CRM</Text>

          <View style={styles.underline} />

          <Text style={styles.tagline}>
            Enterprise Resource Intelligence
          </Text>

          <Text style={styles.description}>
            Seamless management for modern business
            ecosystems. Select a portal to begin.
          </Text>
        </View>

        {/* CARDS */}
        <View
          style={[
            styles.optionsContainer,

            (isDesktop || isTablet) &&
              styles.optionsGrid,

            {
              maxWidth: isDesktop ? 1050 : 650,
            },
          ]}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                router.push(option.route as any)
              }
              activeOpacity={0.85}
              style={[
                styles.cardWrapper,

                (isDesktop || isTablet) &&
                  styles.gridCardWrapper,
              ]}
            >
              <Card style={styles.card} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  {/* ICON */}
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor:
                          option.color + "15",
                      },
                    ]}
                  >
                    <IconButton
                      icon={option.icon}
                      size={36}
                      iconColor={option.color}
                    />
                  </View>

                  {/* TEXT */}
                  <View style={styles.textSection}>
                    <Text
                      style={[
                        styles.optionTitle,
                        {
                          color: option.color,
                        },
                      ]}
                    >
                      {option.title}
                    </Text>

                    <Text style={styles.optionSubtitle}>
                      {option.subtitle}
                    </Text>
                  </View>

                  {/* ARROW */}
                  <IconButton
                    icon="chevron-right"
                    iconColor="rgba(255,255,255,0.45)"
                    size={24}
                  />
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>
            System Version 2.4.0 • Secured by
            Enterprise SSL
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    top: 80,

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
    bottom: 60,

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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingVertical: 60,
  },

  header: {
    alignItems: "center",
    marginBottom: 60,
  },

  brandName: {
    color: "#ffffff",
    fontSize: 64,
    fontWeight: "900",
    letterSpacing: 8,
  },

  underline: {
    width: 90,
    height: 4,
    borderRadius: 30,
    backgroundColor: "#22D3EE",
    marginVertical: 18,
  },

  tagline: {
    color: "#ffffff",
    letterSpacing: 2,
    textAlign: "center",
    fontWeight: "300",
    marginBottom: 10,
    fontSize: 26,
  },

  description: {
    color: "rgba(255,255,255,0.68)",
    textAlign: "center",
    maxWidth: 560,
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
  },

  optionsContainer: {
    width: "100%",
    alignSelf: "center",
    gap: 22,
  },

  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  cardWrapper: {
    width: "100%",
  },

  gridCardWrapper: {
    width: "48%",
    minWidth: 320,
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
        boxShadow:
          "0px 0px 60px rgba(0,0,0,0.45)",
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
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
  },

  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
  },

  textSection: {
    flex: 1,
    marginLeft: 20,
  },

  optionTitle: {
    fontWeight: "900",
    letterSpacing: 0.5,
    fontSize: 22,
  },

  optionSubtitle: {
    color: "rgba(255,255,255,0.62)",
    marginTop: 8,
    lineHeight: 22,
    fontSize: 14,
  },

  footer: {
    marginTop: 80,
    alignItems: "center",
  },

  versionText: {
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.5,
    fontSize: 12,
    fontWeight: "600",
  },
});