import React from "react";
import { 
  View, 
  StyleSheet, 
  ImageBackground, 
  useWindowDimensions, 
  TouchableOpacity,
  Platform,
  ScrollView
} from "react-native";
import { Text, Card, ActivityIndicator, IconButton } from "react-native-paper";
import { router, Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { user, token, isLoading } = useAuth();
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

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
    },
    {
      title: "Public Inquiry",
      subtitle: "Submit your service request and get a premium consultation.",
      icon: "message-draw",
      route: "/public-form",
      color: "#D81B60",
    }
  ];

  return (
    <ImageBackground 
      source={require("../assets/images/auth_bg.png")}
      style={[styles.background, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text variant="displayMedium" style={styles.brandName}>CRM</Text>
            <View style={styles.underline} />
            <Text variant="headlineSmall" style={styles.tagline}>
              Enterprise Resource Intelligence
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              Seamless management for modern business ecosystems. Select a portal to begin.
            </Text>
          </View>

          <View style={[
            styles.optionsContainer, 
            (isDesktop || isTablet) && styles.optionsGrid,
            { maxWidth: isDesktop ? 1000 : 600 }
          ]}>
            {options.map((option, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => router.push(option.route as any)}
                activeOpacity={0.8}
                style={[
                  styles.cardWrapper,
                  (isDesktop || isTablet) && styles.gridCardWrapper
                ]}
              >
                <Card style={styles.card} mode="elevated">
                  <Card.Content style={styles.cardContent}>
                    <View style={[styles.iconCircle, { backgroundColor: option.color + '15' }]}>
                      <IconButton 
                        icon={option.icon} 
                        size={36} 
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
                    <IconButton icon="chevron-right" iconColor="#ccc" size={24} />
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.versionText}>System Version 2.4.0 • Secured by Enterprise SSL</Text>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 35, 126, 0.45)',
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
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  brandName: {
    color: "#fff",
    fontWeight: "900",
    letterSpacing: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  underline: {
    width: 80,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginVertical: 16,
  },
  tagline: {
    color: "#fff",
    letterSpacing: 2,
    textAlign: 'center',
    fontWeight: '300',
    marginBottom: 8,
  },
  description: {
    color: "rgba(255,255,255,0.7)",
    textAlign: 'center',
    maxWidth: 500,
    marginTop: 8,
  },
  optionsContainer: {
    width: '100%',
    alignSelf: 'center',
    gap: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cardWrapper: {
    width: '100%',
  },
  gridCardWrapper: {
    width: '48%',
    minWidth: 300,
  },
  card: {
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    ...Platform.select({
      web: {
        boxShadow: "0px 15px 35px rgba(0,0,0,0.2)",
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
    padding: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
    marginLeft: 20,
  },
  optionTitle: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  optionSubtitle: {
    color: '#555',
    marginTop: 6,
    lineHeight: 20,
    fontSize: 14,
  },
  footer: {
    marginTop: 80,
    alignItems: 'center',
  },
  versionText: {
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    fontSize: 12,
    fontWeight: '600',
  }
});