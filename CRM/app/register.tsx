import React, { useState } from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ImageBackground, 
  useWindowDimensions,
  TouchableOpacity
} from "react-native";
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Portal, 
  Dialog,
  SegmentedButtons
} from "react-native-paper";
import { router } from "expo-router";
import API from "../services/api";

export default function Register() {
  const { width, height } = useWindowDimensions();
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
        alert("Registration Successful! Your account is pending admin approval.");
        router.push("/employeeLogin");
      } else {
        await API.post("/admin/register", form);
        setShowOTP(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "We encountered an error during registration. Please try again.");
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
      alert("Verification successful! You can now log in as an administrator.");
      router.push("/adminLogin");
    } catch (err) {
      setError("The OTP entered is incorrect. Please request a new one if needed.");
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ImageBackground 
        source={require("../assets/images/auth_bg.png")}
        style={[styles.background, { width, height }]}
        resizeMode="cover"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.glassWrapper, { maxWidth: isDesktop ? 500 : isTablet ? 450 : '100%' }]}>
              <View style={styles.logoSection}>
                <Text variant="displaySmall" style={styles.brandName}>CRM</Text>
                <Text variant="bodyMedium" style={styles.brandTagline}>JOIN THE ENTERPRISE ECOSYSTEM</Text>
              </View>

              <Card style={styles.card} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <Text variant="titleLarge" style={styles.sectionTitle}>Create Account</Text>
                  
                  <SegmentedButtons
                    value={role}
                    onValueChange={setRole}
                    style={styles.segmented}
                    theme={{ colors: { secondaryContainer: '#E3F2FD', onSecondaryContainer: '#1565C0' } }}
                    buttons={[
                      { value: "employee", label: "Employee", icon: "account-tie" },
                      { value: "admin", label: "Admin", icon: "shield-crown" },
                    ]}
                  />

                  <TextInput
                    label="Full Name"
                    value={form.name}
                    onChangeText={(t) => setForm({ ...form, name: t })}
                    mode="flat"
                    activeUnderlineColor="#1565C0"
                    autoComplete="name"
                    textContentType="name"
                    left={<TextInput.Icon icon="account-outline" />}
                    style={styles.input}
                    textColor="#000"
                  />

                  <TextInput
                    label="Business Email"
                    value={form.email}
                    onChangeText={(t) => setForm({ ...form, email: t })}
                    mode="flat"
                    activeUnderlineColor="#1565C0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    left={<TextInput.Icon icon="email-outline" />}
                    style={styles.input}
                    textColor="#000"
                  />

                  <TextInput
                    label="Secure Password"
                    value={form.password}
                    onChangeText={(t) => setForm({ ...form, password: t })}
                    mode="flat"
                    activeUnderlineColor="#1565C0"
                    secureTextEntry
                    autoComplete="password"
                    textContentType="password"
                    left={<TextInput.Icon icon="lock-outline" />}
                    style={styles.input}
                    textColor="#000"
                  />

                  <Button 
                    mode="contained" 
                    onPress={register} 
                    loading={loading}
                    disabled={loading}
                    style={styles.mainButton}
                    labelStyle={styles.buttonLabel}
                    buttonColor="#1565C0"
                    textColor="white"
                  >
                    {showOTP ? "RESEND CODE" : "CREATE ACCOUNT"}
                  </Button>

                  <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.line} />
                  </View>

                  <View style={styles.footer}>
                    <Text variant="bodyMedium" style={styles.footerText}>Already registered?</Text>
                    <View style={styles.linkRow}>
                      <TouchableOpacity onPress={() => router.push("/adminLogin")}>
                        <Text style={styles.link}>Admin Access</Text>
                      </TouchableOpacity>
                      <Text style={styles.dot}>•</Text>
                      <TouchableOpacity onPress={() => router.push("/employeeLogin")}>
                        <Text style={styles.link}>Employee Workspace</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </View>

            <Portal>
              <Dialog visible={showOTP} onDismiss={() => setShowOTP(false)} style={styles.dialog}>
                <Dialog.Title style={styles.dialogTitle}>Email Verification</Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium" style={styles.dialogMsg}>
                    For security, please enter the 6-digit code sent to:
                    {"\n"}<Text style={{ fontWeight: 'bold' }}>{form.email}</Text>
                  </Text>
                  <TextInput
                    placeholder="Enter Code"
                    value={otp}
                    onChangeText={setOtp}
                    mode="outlined"
                    keyboardType="numeric"
                    maxLength={6}
                    style={styles.otpInput}
                    textAlign="center"
                    outlineColor="#1565C0"
                  />
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setShowOTP(false)} textColor="#666">CANCEL</Button>
                  <Button mode="contained" loading={loading} onPress={verifyOTP} buttonColor="#1565C0" textColor="white">VERIFY</Button>
                </Dialog.Actions>
              </Dialog>

              <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialog}>
                <Dialog.Title style={styles.errorTitle}>Notification</Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium" style={styles.errorMsg}>{error}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={hideDialog} mode="text" textColor="#1565C0">UNDERSTOOD</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
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
    flex: 1,
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
    width: '100%',
    alignSelf: 'center',
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  brandName: {
    color: "#fff",
    fontWeight: "900",
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  brandTagline: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 8,
    fontWeight: '700',
  },
  card: {
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    ...Platform.select({
      web: {
        boxShadow: "0px 20px 50px rgba(0,0,0,0.25)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
      }
    }),
  },
  cardContent: {
    padding: 24,
  },
  sectionTitle: {
    textAlign: "center",
    color: "#1A237E",
    fontWeight: "800",
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  segmented: {
    marginBottom: 32,
  },
  input: {
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  mainButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontWeight: "800",
    letterSpacing: 1.5,
    fontSize: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#EEE",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#999",
    fontSize: 11,
    fontWeight: "800",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    marginBottom: 12,
    fontWeight: '500',
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  link: {
    color: "#1565C0",
    fontWeight: "800",
    fontSize: 14,
  },
  dot: {
    marginHorizontal: 12,
    color: "#DDD",
    fontSize: 18,
  },
  dialog: {
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  dialogTitle: {
    textAlign: 'center',
    color: '#1565C0',
    fontWeight: '900',
  },
  dialogMsg: {
    textAlign: 'center',
    lineHeight: 24,
    color: '#555',
  },
  otpInput: {
    marginTop: 24,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 10,
  },
  errorTitle: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  errorMsg: {
    color: '#444',
  }
});