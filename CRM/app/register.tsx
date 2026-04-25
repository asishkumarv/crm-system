import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import API from "../services/api";

export default function Register() {
  const [role, setRole] = useState("employee"); // employee / admin
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);

  // 🔹 Register Handler
  const register = async () => {
    try {
      if (role === "employee") {
        await API.post("/employee/Register", form);
        alert("Waiting for admin approval");
      } else {
        await API.post("/admin/Register", form);
        alert("OTP sent to email");
        setShowOTP(true);
      }
    } catch (err) {
      alert("Error in registration");
    }
  };

  // 🔹 Verify OTP (Admin)
  const verifyOTP = async () => {
    try {
      await API.post("/admin/verify-otp", {
        email: form.email,
        otp,
      });
      alert("Admin verified successfully");
      setShowOTP(false);
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>
        Register as {role}
      </Text>

      {/* 🔘 ROLE SELECT */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <Button title="Employee" onPress={() => setRole("employee")} />
        <View style={{ width: 10 }} />
        <Button title="Admin" onPress={() => setRole("admin")} />
      </View>

      {/* 📝 FORM */}
      <TextInput
        placeholder="Name"
        onChangeText={(t) => setForm({ ...form, name: t })}
        style={{ marginBottom: 10, borderWidth: 1, padding: 10 }}
      />

      <TextInput
        placeholder="Email"
        onChangeText={(t) => setForm({ ...form, email: t })}
        style={{ marginBottom: 10, borderWidth: 1, padding: 10 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={(t) => setForm({ ...form, password: t })}
        style={{ marginBottom: 10, borderWidth: 1, padding: 10 }}
      />

      <Button title="Register" onPress={register} />

      {/* 🔐 OTP SECTION (ONLY FOR ADMIN) */}
      {showOTP && (
        <View style={{ marginTop: 20 }}>
          <Text>Enter OTP</Text>

          <TextInput
            placeholder="OTP"
            keyboardType="numeric"
            onChangeText={setOtp}
            style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
          />

          <Button title="Verify OTP" onPress={verifyOTP} />
        </View>
      )}
    </View>
  );
}