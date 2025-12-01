import {
  DarkTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { getStoredUser, verifyToken } from "@/server/auth";
import { usePathname, useRouter, useSegments } from "expo-router";

// Keep splash screen visible while we check auth
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

function useProtectedRoute(isAuthenticated: boolean | null, recheckAuth: () => Promise<void>) {
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until auth check is complete
    if (isAuthenticated === null) return;

    const inAuthGroup = segments[0] === "login";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated and on login
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, router]);

  // Re-check auth when navigating to tabs (in case of fresh login)
  useEffect(() => {
    if (segments[0] === "(tabs)") {
      recheckAuth();
    }
  }, [pathname]);
}

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      // First check if user exists locally (faster)
      const storedUser = await getStoredUser();
      if (storedUser) {
        setIsAuthenticated(true);
        // Verify token in background
        verifyToken().then(user => {
          if (!user) setIsAuthenticated(false);
        });
      } else {
        const user = await verifyToken();
        setIsAuthenticated(!!user);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useProtectedRoute(isAuthenticated, checkAuth);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
