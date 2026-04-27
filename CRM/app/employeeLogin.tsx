import React, { useState } from "react";
import { 
  View, 
  StyleSheet, 
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
  Dialog
} from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const { width, height } = Dimensions.get("window");

export default function EmployeeLogin() {
  const { login: setAuth } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

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
        style={styles.background}
        resizeMode="cover"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <View style={styles.scrollContent}>
            <View style={styles.glassWrapper}>
              <View style={styles.logoSection}>
                <Text variant="headlineSmall" style={styles.brandName}>CRM</Text>
                {/* <Text variant="bodyMedium" style={styles.brandTagline}>Employee Workspace Portal</Text> */}
              </View>

              <Card style={styles.card} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>Employee Login</Text>

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
                    <TouchableOpacity onPress={() => router.push("/register")} style={{ marginTop: 12 }}>
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
          </View>
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
    flex: 1,
    justifyContent: "center",
    padding: 24,
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
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  brandName: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 2,
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
    })
  },
  cardContent: {
    padding: 16,
  },
  sectionTitle: {
    textAlign: "center",
    color: "#004D40",
    fontWeight: "700",
    marginBottom: 24,
  },
  input: {
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  mainButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 4,
  },
  buttonLabel: {
    fontWeight: "700",
    letterSpacing: 1,
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
  },
  link: {
    color: "#00796B",
    fontWeight: "700",
    fontSize: 13,
  },
  dialog: {
    borderRadius: 20,
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
