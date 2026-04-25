import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
export default function Index() {
  return <Redirect href="/register" />;
}