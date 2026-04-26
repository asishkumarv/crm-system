import { useEffect } from "react";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "../context/AuthContext";
import * as Font from "expo-font";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loaded, error] = useFonts({
    ...MaterialCommunityIcons.font,
    ...MaterialIcons.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <PaperProvider>
        {/* Inject font-face directly into web DOM */}
        {typeof window !== 'undefined' && (
          <style dangerouslySetInnerHTML={{ __html: `
            @font-face {
              font-family: 'MaterialCommunityIcons';
              src: url('https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/7.2.96/fonts/materialdesignicons-webfont.woff2') format('woff2');
              font-weight: normal;
              font-style: normal;
            }
            @font-face {
              font-family: 'MaterialIcons';
              src: url('https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2') format('woff2');
              font-weight: normal;
              font-style: normal;
            }
          `}} />
        )}
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </AuthProvider>
  );
}