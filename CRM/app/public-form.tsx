import React, { useState } from "react";
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ImageBackground, 
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions
} from "react-native";
import { 
  TextInput, 
  Button, 
  Text, 
  useTheme,
  ActivityIndicator,
  IconButton,
  Avatar
} from "react-native-paper";
import API from "../services/api";

export default function PublicLeadForm() {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isVerySmall = width < 400;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceNeeded: "",
    source: "Instagram" 
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.serviceNeeded) {
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
        source: formData.source
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data || "Submission failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const sources = [
    { label: "Instagram", value: "Instagram", icon: "instagram", color: "#E1306C" },
    { label: "Facebook", value: "Facebook", icon: "facebook", color: "#1877F2" },
    { label: "LinkedIn", value: "LinkedIn", icon: "linkedin", color: "#0A66C2" },
    { label: "Other", value: "Other", icon: "dots-horizontal", color: "#607D8B" }
  ];

  if (success) {
    return (
      <View style={styles.outerContainer}>
        <ImageBackground 
          source={{ uri: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop" }}
          style={[styles.background, { width, height }]}
        >
          <View style={styles.darkOverlay}>
            <View style={styles.successWrapper}>
              <Avatar.Icon size={isMobile ? 60 : 80} icon="rocket-launch" style={{ backgroundColor: '#FFD700' }} color="#1A237E" />
              <Text variant={isMobile ? "headlineMedium" : "headlineLarge"} style={styles.successHeader}>You're On Board!</Text>
              <Text style={[styles.successSub, isMobile && { fontSize: 16, lineHeight: 24 }]}>
                One of our strategy experts will contact you shortly to discuss your requirements.
              </Text>
              <TouchableOpacity onPress={() => setSuccess(false)} style={styles.minimalButton}>
                <Text style={styles.minimalButtonText}>BACK TO FORM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={{ uri: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop" }}
        style={[styles.background, { width, height }]}
      >
        <View style={styles.darkOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.flex}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              <View style={[styles.content, { paddingHorizontal: isMobile ? 16 : 24 }]}>
                
                <View style={[styles.heroSection, { marginTop: isMobile ? 20 : 40 }]}>
                  <Text style={[styles.kicker, isVerySmall && { fontSize: 10, letterSpacing: 2 }]}>ELEVATE YOUR BUSINESS</Text>
                  <Text style={[styles.heroTitle, isMobile && { fontSize: 32, lineHeight: 38 }]}>
                    Let's Build Something <Text style={styles.goldText}>Great</Text>
                  </Text>
                  <Text style={[styles.heroSub, isMobile && { fontSize: 14, maxWidth: '100%' }]}>
                    Premium consulting and enterprise solutions tailored for your success.
                  </Text>
                </View>

                <View style={[styles.formCard, { padding: isMobile ? 20 : 32 }]}>
                  {error ? (
                    <View style={styles.errorBanner}>
                      <IconButton icon="alert-circle" iconColor="#FF5252" size={20} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  <View style={styles.inputWrapper}>
                    <IconButton icon="account-tie" iconColor="#1A237E" size={24} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Your Full Name"
                      value={formData.name}
                      onChangeText={(t) => setFormData({...formData, name: t})}
                      style={styles.premiumInput}
                      textColor="#1A237E"
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      placeholderTextColor="#90A4AE"
                    />
                  </View>

                  <View style={[styles.inputRow, isMobile && { flexDirection: 'column' }]}>
                    <View style={[styles.inputWrapper, { flex: isMobile ? 0 : 1, marginRight: isMobile ? 0 : 10 }]}>
                      <IconButton icon="email-seal" iconColor="#1A237E" size={20} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Email Address"
                        value={formData.email}
                        onChangeText={(t) => setFormData({...formData, email: t})}
                        style={styles.premiumInput}
                        textColor="#1A237E"
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        placeholderTextColor="#90A4AE"
                      />
                    </View>
                    <View style={[styles.inputWrapper, { flex: isMobile ? 0 : 1 }]}>
                      <IconButton icon="phone-classic" iconColor="#1A237E" size={20} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChangeText={(t) => setFormData({...formData, phone: t})}
                        style={styles.premiumInput}
                        textColor="#1A237E"
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        placeholderTextColor="#90A4AE"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputWrapper, { alignItems: 'flex-start', height: isMobile ? 100 : 120 }]}>
                    <IconButton icon="comment-quote" iconColor="#1A237E" size={24} style={[styles.inputIcon, { marginTop: 12 }]} />
                    <TextInput
                      placeholder="About your project..."
                      value={formData.serviceNeeded}
                      onChangeText={(t) => setFormData({...formData, serviceNeeded: t})}
                      multiline
                      style={[styles.premiumInput, { height: isMobile ? 80 : 100, paddingTop: 16 }]}
                      textColor="#1A237E"
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      placeholderTextColor="#90A4AE"
                    />
                  </View>

                  <Text style={styles.sourceLabel}>WHERE DID YOU HEAR ABOUT US?</Text>
                  <View style={styles.sourceGrid}>
                    {sources.map((s) => (
                      <TouchableOpacity 
                        key={s.value} 
                        onPress={() => setFormData({...formData, source: s.value})}
                        style={[
                          styles.sourceItem, 
                          { width: isMobile ? '100%' : '48%' },
                          formData.source === s.value && { borderColor: s.color, backgroundColor: s.color + '08' }
                        ]}
                      >
                        <IconButton icon={s.icon} iconColor={formData.source === s.value ? s.color : '#90A4AE'} size={24} />
                        <Text style={[styles.sourceText, formData.source === s.value && { color: s.color, fontWeight: '800' }]}>
                          {s.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.ctaButton}>
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <View style={styles.buttonInner}>
                        <Text style={[styles.ctaText, isVerySmall && { fontSize: 14 }]}>BOOK A CONSULTATION</Text>
                        <IconButton icon="arrow-right" iconColor="white" size={20} />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                  <Text style={[styles.footerText, isVerySmall && { fontSize: 8 }]}>TRUSTED BY FORTUNE 500 COMPANIES</Text>
                  <View style={styles.trustLine} />
                  <Text style={styles.footerCopy}>© 2026 CRM-System.</Text>
                </View>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  background: {
    // Width and height handled dynamically in component
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 40, 0.75)',
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    alignItems: 'center',
  },
  heroSection: {
    marginBottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  kicker: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 12,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -1,
  },
  goldText: {
    color: '#FFD700',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    maxWidth: 340,
    lineHeight: 24,
  },
  formCard: {
    width: '100%',
    maxWidth: 700,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    ...Platform.select({
      web: {
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
      },
      default: {
        elevation: 15,
      }
    }),
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    marginBottom: 24,
    paddingRight: 12,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 16,
    marginBottom: 16,
    minHeight: 56,
    paddingHorizontal: 8,
  },
  inputIcon: {
    margin: 0,
  },
  premiumInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 15,
    fontWeight: '600',
    color: '#1A237E',
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
  },
  sourceLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#90A4AE',
    letterSpacing: 1.5,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ECEFF1',
    borderRadius: 16,
    paddingRight: 12,
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 13,
    color: '#546E7A',
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#1A237E',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px rgba(26, 35, 126, 0.4)',
      }
    })
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  trustLine: {
    width: 40,
    height: 2,
    backgroundColor: '#FFD700',
    marginVertical: 16,
  },
  footerCopy: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
  },
  successWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successHeader: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 24,
    textAlign: 'center',
  },
  successSub: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
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
    borderColor: '#FFD700',
  },
  minimalButtonText: {
    color: '#FFD700',
    fontWeight: '900',
    letterSpacing: 2,
  }
});
