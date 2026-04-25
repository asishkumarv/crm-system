import { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import API from "../services/api";

export default function AdminLogin({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await API.post("/admin/login", { email, password });
    localStorage.setItem("token", res.data.token);
    navigation.navigate("AdminDashboard");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Admin Login</Text>
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <Button title="Login" onPress={login} />
    </View>
  );
}