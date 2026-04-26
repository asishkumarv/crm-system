import React, { useState } from "react";
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ImageBackground, 
  Dimensions,
  ScrollView,
  Alert
} from "react-native";
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  useTheme,
  RadioButton,
  ActivityIndicator,
  Portal,
  Dialog,
  IconButton
} from "react-native-paper";
import { router } from "expo-router";
import API from "../services/api";

const { width, height } = Dimensions.get("window");

export default function PublicLeadForm() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceNeeded: "",
    source: "Instagram" // default
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.serviceNeeded) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Map formData to backend expected fields
      // name -> name
      // phone -> phone
      // email -> email
      // serviceNeeded -> query
      // source -> source
      await API.post("/leads", {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        query: formData.serviceNeeded,
        source: formData.source
      });
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        serviceNeeded: "",
        source: "Instagram"
      });
    } catch (err: any) {
      setError(err.response?.data || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.outerContainer}>
        <ImageBackground 
          source={{ uri: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop" }}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.successContainer}>
            <View style={styles.successCard}>
              <IconButton
                icon="check-circle"
                iconColor="#4CAF50"
                size={80}
              />
              <Text variant="headlineMedium" style={styles.successTitle}>Thank You!</Text>
              <Text variant="bodyLarge" style={styles.successMsg}>
                Your request has been submitted successfully. Our team will contact you shortly.
              </Text>
              <Button 
                mode="contained" 
                onPress={() => setSuccess(false)}
                style={styles.backButton}
                buttonColor="#1A237E"
              >
                Submit Another Request
              </Button>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <ImageBackground 
        source={{ uri: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop" }}
        style={styles.background}
        resizeMode="cover"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.glassWrapper}>
              <View style={styles.headerSection}>
                <Text variant="headlineMedium" style={styles.mainTitle}>Get in Touch</Text>
                <Text variant="bodyMedium" style={styles.subTitle}>Experience our premium services</Text>
              </View>

              <Card style={styles.card} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  {error ? (
                    <View style={styles.errorBanner}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  <TextInput
                    label="Full Name"
                    value={formData.name}
                    onChangeText={(text) => setFormData({...formData, name: text})}
                    mode="outlined"
                    style={styles.input}
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#1A237E"
                    left={<TextInput.Icon icon="account-outline" />}
                  />

                  <TextInput
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(text) => setFormData({...formData, email: text})}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#1A237E"
                    left={<TextInput.Icon icon="email-outline" />}
                  />

                  <TextInput
                    label="Phone Number"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({...formData, phone: text})}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="phone-pad"
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#1A237E"
                    left={<TextInput.Icon icon="phone-outline" />}
                  />

                  <TextInput
                    label="Service Needed"
                    value={formData.serviceNeeded}
                    onChangeText={(text) => setFormData({...formData, serviceNeeded: text})}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    style={[styles.input, { height: 100 }]}
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#1A237E"
                    left={<TextInput.Icon icon="briefcase-outline" />}
                  />

                  <View style={styles.sourceContainer}>
                    <Text variant="bodyMedium" style={styles.sourceLabel}>Where did you find us?</Text>
                    <RadioButton.Group 
                      onValueChange={value => setFormData({...formData, source: value})} 
                      value={formData.source}
                    >
                      <View style={styles.radioRow}>
                        <View style={styles.radioItem}>
                          <RadioButton value="Instagram" color="#C13584" />
                          <Text>Instagram</Text>
                        </View>
                        <View style={styles.radioItem}>
                          <RadioButton value="Facebook" color="#1877F2" />
                          <Text>Facebook</Text>
                        </View>
                      </View>
                    </RadioButton.Group>
                  </View>

                  <Button 
                    mode="contained" 
                    onPress={handleSubmit} 
                    loading={loading}
                    disabled={loading}
                    style={styles.submitButton}
                    contentStyle={styles.submitButtonContent}
                    labelStyle={styles.submitButtonLabel}
                    buttonColor="#1A237E"
                  >
                    Submit Inquiry
                  </Button>
                </Card.Content>
              </Card>
              
              <View style={styles.footer}>
                <Text style={styles.footerText}>© 2026 CRM Systems. All rights reserved.</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  background: {
    width: width,
    height: height,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingVertical: 40,
  },
  glassWrapper: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  mainTitle: {
    color: "#fff",
    fontWeight: "800",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subTitle: {
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 8,
    letterSpacing: 1,
  },
  card: {
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    padding: 8,
    ...Platform.select({
      web: {
        boxShadow: "0px 20px 40px rgba(0,0,0,0.25)",
      },
      default: {
        elevation: 12,
      }
    })
  },
  cardContent: {
    padding: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  sourceContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sourceLabel: {
    color: "#666",
    marginBottom: 8,
    fontWeight: "600",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
  },
  submitButtonContent: {
    height: 56,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  errorBanner: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#D32F2F",
  },
  errorText: {
    color: "#C62828",
    fontSize: 13,
    fontWeight: "600",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successCard: {
    backgroundColor: "white",
    width: '100%',
    maxWidth: 400,
    padding: 40,
    borderRadius: 32,
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: "0px 20px 50px rgba(0,0,0,0.3)",
      },
      default: {
        elevation: 15,
      }
    })
  },
  successTitle: {
    fontWeight: "800",
    color: "#1A237E",
    marginTop: 16,
  },
  successMsg: {
    textAlign: "center",
    color: "#666",
    marginTop: 12,
    lineHeight: 24,
  },
  backButton: {
    marginTop: 32,
    borderRadius: 12,
    width: '100%',
  },
  footer: {
    marginTop: 30,
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  }
});
