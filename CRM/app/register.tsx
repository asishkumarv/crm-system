import React, { useState } from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ImageBackground, 
  Image,
  Dimensions,
  TouchableOpacity
} from "react-native";
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  useTheme, 
  Portal, 
  Dialog,
  SegmentedButtons,
  MD3DarkTheme,
  MD3LightTheme
} from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const { width, height } = Dimensions.get("window");

export default function Register() {
  const paperTheme = useTheme();
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
        style={styles.background}
        resizeMode="cover"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.glassWrapper}>
              <View style={styles.logoSection}>
                <Text variant="headlineSmall" style={styles.brandName}>CRM</Text>
                {/* <Text variant="bodyMedium" style={styles.brandTagline}>Enterprise Resource Intelligence</Text> */}
              </View>

              <Card style={styles.card} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>Account Registration</Text>
                  
                  <SegmentedButtons
                    value={role}
                    onValueChange={setRole}
                    style={styles.segmented}
                    theme={{ colors: { secondaryContainer: '#E3F2FD', onSecondaryContainer: '#1565C0' } }}
                    buttons={[
                      { value: "employee", label: "Employee", icon: "account-tie" },
                      { value: "admin", label: "Administrator", icon: "shield-crown" },
                    ]}
                  />

                  <TextInput
                    label="Full Name"
                    value={form.name}
                    onChangeText={(t) => setForm({ ...form, name: t })}
                    mode="flat"
                    activeUnderlineColor="#1565C0"
                    left={<TextInput.Icon icon="account-outline" />}
                    style={styles.input}
                  />

                  <TextInput
                    label="Business Email"
                    value={form.email}
                    onChangeText={(t) => setForm({ ...form, email: t })}
                    mode="flat"
                    activeUnderlineColor="#1565C0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    left={<TextInput.Icon icon="email-outline" />}
                    style={styles.input}
                  />

                  <TextInput
                    label="Secure Password"
                    value={form.password}
                    onChangeText={(t) => setForm({ ...form, password: t })}
                    mode="flat"
                    activeUnderlineColor="#1565C0"
                    secureTextEntry
                    left={<TextInput.Icon icon="lock-outline" />}
                    style={styles.input}
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
                    {showOTP ? "RESEND VERIFICATION CODE" : "CREATE ACCOUNT"}
                  </Button>

                  <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.line} />
                  </View>

                  <View style={styles.footer}>
                    <Text variant="bodySmall" style={styles.footerText}>Already have an account?</Text>
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
    width: width,
    height: height,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  glassWrapper: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  brandName: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 2,
    ...Platform.select({
      web: {
        textShadow: "0px 2px 4px rgba(0,0,0,0.3)",
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      }
    })
  },
  brandTagline: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    letterSpacing: 1.5,
    marginTop: 4,
  },
    card: {
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    ...Platform.select({
      web: {
        boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
      }
    }),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cardContent: {
    padding: 16,
  },
  sectionTitle: {
    textAlign: "center",
    color: "#1A237E",
    fontWeight: "700",
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  segmented: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 20,
    backgroundColor: "transparent",
    fontSize: 14,
  },
  mainButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 4,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 8px rgba(21, 101, 192, 0.3)",
      },
      default: {
        shadowColor: "#1565C0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      }
    })
  },
  buttonLabel: {
    fontWeight: "700",
    letterSpacing: 1,
    fontSize: 14,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#9E9E9E",
    fontSize: 10,
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    color: "#757575",
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  link: {
    color: "#1565C0",
    fontWeight: "700",
    fontSize: 13,
  },
  dot: {
    marginHorizontal: 10,
    color: "#BDBDBD",
  },
  dialog: {
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  dialogTitle: {
    textAlign: 'center',
    color: '#1565C0',
    fontWeight: 'bold',
  },
  dialogMsg: {
    textAlign: 'center',
    lineHeight: 22,
    color: '#444',
  },
  otpInput: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  errorTitle: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  errorMsg: {
    color: '#444',
  }
});