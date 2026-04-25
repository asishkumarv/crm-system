import React, { useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  ImageBackground, 
  Dimensions, 
  TouchableOpacity,
  Platform,
  ScrollView
} from "react-native";
import { Text, Card, Avatar, useTheme, IconButton, ActivityIndicator } from "react-native-paper";
import { router, Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

export default function LandingPage() {
  const { user, token, isLoading } = useAuth();
  const theme = useTheme();

  // If already logged in, redirect to appropriate dashboard
  if (!isLoading && token && user) {
    if (user.role === 'admin') return <Redirect href="/(tabs)/adminDashboard" />;
    if (user.role === 'employee') return <Redirect href="/(tabs)/employeeDashboard" />;
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A237E" />
      </View>
    );
  }

  const options = [
    {
      title: "New Registration",
      subtitle: "Establish your corporate profile and join the CRM ecosystem.",
      icon: "account-plus-outline",
      route: "/register",
      color: "#1565C0",
    },
    {
      title: "Admin Portal",
      subtitle: "Secure access for system administrators and managers.",
      icon: "shield-account-outline",
      route: "/adminLogin",
      color: "#1A237E",
    },
    {
      title: "Employee Hub",
      subtitle: "Dedicated workspace for lead processing and operations.",
      icon: "briefcase-variant-outline",
      route: "/employeeLogin",
      color: "#00796B",
    }
  ];

  return (
    <ImageBackground 
      source={require("../assets/images/auth_bg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text variant="displaySmall" style={styles.brandName}>CRM</Text>
            <View style={styles.underline} />
            <Text variant="titleMedium" style={styles.tagline}>
              Enterprise Resource Intelligence
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => router.push(option.route as any)}
                activeOpacity={0.9}
              >
                <Card style={styles.card} mode="elevated">
                  <Card.Content style={styles.cardContent}>
                    <View style={[styles.iconCircle, { backgroundColor: option.color + '15' }]}>
                      <IconButton 
                        icon={option.icon} 
                        size={32} 
                        iconColor={option.color} 
                      />
                    </View>
                    <View style={styles.textSection}>
                      <Text variant="titleLarge" style={[styles.optionTitle, { color: option.color }]}>
                        {option.title}
                      </Text>
                      <Text variant="bodyMedium" style={styles.optionSubtitle}>
                        {option.subtitle}
                      </Text>
                    </View>
                    <IconButton icon="chevron-right" iconColor="#ccc" />
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 35, 126, 0.4)', // Subtle navy overlay
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  brandName: {
    color: "#fff",
    fontWeight: "900",
    letterSpacing: 4,
    ...Platform.select({
      web: {
        textShadow: "0px 4px 8px rgba(0,0,0,0.3)",
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      }
    })
  },
  underline: {
    width: 60,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginVertical: 12,
  },
  tagline: {
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1.5,
    textAlign: 'center',
    fontWeight: '300',
  },
  optionsContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    ...Platform.select({
      web: {
        boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
      }
    }),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  optionSubtitle: {
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
    fontSize: 13,
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
  },
  versionText: {
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  }
});