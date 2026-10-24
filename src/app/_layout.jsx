import { Platform, StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { store } from "@/store";
import StoreHydrator from "@/store/StoreHydrator";
import { queryClient } from "@/lib/queryClient";
import { colors } from "@/theme";

const isWeb = Platform.OS === "web";

if (isWeb && typeof document !== "undefined") {
  const id = "rnw-outline-reset";
  if (!document.getElementById(id)) {
    const styleEl = document.createElement("style");
    styleEl.id = id;
    styleEl.textContent = `
      input, textarea, select {
        outline: none !important;
        outline-style: none !important;
        box-shadow: none !important;
      }
      input:focus, textarea:focus, select:focus {
        outline: none !important;
        outline-style: none !important;
        box-shadow: none !important;
      }
      *:focus {
        outline: none !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
}

// Redux Toolkit for client state (session, cart, wishlist); TanStack Query for server data
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <StoreHydrator />
            <StatusBar style="dark" />
            <View style={styles.webWrapper}>
              <View style={styles.appContainer}>
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }} />
              </View>
            </View>
          </QueryClientProvider>
        </ReduxProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    height: "100%",
    backgroundColor: isWeb ? "#e5e7eb" : colors.canvas,
  },
  webWrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    backgroundColor: isWeb ? "#e5e7eb" : colors.canvas,
  },
  appContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    maxWidth: isWeb ? 480 : "100%",
    backgroundColor: colors.canvas,
    overflow: "hidden",
    ...(isWeb
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
        }
      : {}),
  },
});
