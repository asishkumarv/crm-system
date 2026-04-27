import React, { useState } from "react";
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ImageBackground, 
  useWindowDimensions,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Portal,
  Dialog
} from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function EmployeeLogin() {
  const { login: setAuth } = useAuth();
  const { width, height } = useWindowDimensions();
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
      const res = await API.post("/employee/login", { email, password });
      if (Platform.OS === 'web') {
        (document.activeElement as HTMLElement)?.blur();
      }
      setAuth({ email, role: 'employee', id: res.data.userId }, res.data.token);
      router.push("/(tabs)/employeeDashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please verify your employee credentials.");
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
          <ScrollView 
            contentContainerStyle={[
              styles.scrollContent, 
              { paddingHorizontal: isDesktop ? width * 0.1 : 24 }
            ]}
            centerContent={true}
          >
            <View style={[styles.glassWrapper, { maxWidth: isDesktop ? 450 : isTablet ? 400 : '100%' }]}>
              <View style={styles.logoSection}>
                <Text variant="displaySmall" style={styles.brandName}>CRM</Text>
                <Text variant="bodyMedium" style={styles.brandTagline}>EMPLOYEE WORKSPACE</Text>
              </View>

              <Card style={styles.card} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <Text variant="titleLarge" style={styles.sectionTitle}>Employee Sign In</Text>

                  <TextInput
                    label="Employee Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="flat"
                    activeUnderlineColor="#00796B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    left={<TextInput.Icon icon="account-circle-outline" />}
                    style={styles.input}
                    textColor="#000"
                  />

                  <TextInput
                    label="Security Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="flat"
                    activeUnderlineColor="#00796B"
                    secureTextEntry
                    autoComplete="password"
                    textContentType="password"
                    left={<TextInput.Icon icon="shield-key-outline" />}
                    style={styles.input}
                    textColor="#000"
                  />

                  <Button 
                    mode="contained" 
                    onPress={login} 
                    loading={loading}
                    disabled={loading}
                    style={styles.mainButton}
                    labelStyle={styles.buttonLabel}
                    buttonColor="#00796B"
                    textColor="white"
                  >
                     LOG IN
                  </Button>

                  <View style={styles.footer}>
                    <TouchableOpacity onPress={() => router.push("/employeeForgotPassword")}>
                      <Text style={styles.link}>Forgot Password?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/register")} style={{ marginTop: 16 }}>
                      <Text style={styles.link}>Request Access Privileges</Text>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            </View>

            <Portal>
              <Dialog visible={visible} onDismiss={() => setVisible(false)} style={styles.dialog}>
                <Dialog.Title style={styles.errorTitle}>Access Denied</Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium" style={styles.errorMsg}>{error}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setVisible(false)} textColor="#00796B">RETRY</Button>
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
    paddingVertical: 40,
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandTagline: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 8,
    fontWeight: '700',
  },
  card: {
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    ...Platform.select({
      web: {
        boxShadow: "0px 20px 40px rgba(0,0,0,0.25)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
      }
    })
  },
  cardContent: {
    padding: 24,
  },
  sectionTitle: {
    textAlign: "center",
    color: "#004D40",
    fontWeight: "800",
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
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  link: {
    color: "#00796B",
    fontWeight: "700",
    fontSize: 14,
  },
  dialog: {
    borderRadius: 24,
    backgroundColor: '#fff',
  },
  errorTitle: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  errorMsg: {
    color: '#444',
  }
});
