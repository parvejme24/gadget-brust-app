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

  // App-like web view: phone viewport, brand colour bar, installable (Add to Home Screen) via /manifest.json
  const headTags = [
    ["meta", { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" }],
    ["meta", { name: "theme-color", content: "#38ad81" }],
    ["meta", { name: "description", content: "Genuine gadgets with official warranty, fast delivery across Bangladesh." }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    ["meta", { name: "mobile-web-app-capable", content: "yes" }],
    ["meta", { name: "apple-mobile-web-app-status-bar-style", content: "default" }],
    ["meta", { name: "apple-mobile-web-app-title", content: "Gadget Brust" }],
    ["link", { rel: "manifest", href: "/manifest.json" }],
    ["link", { rel: "apple-touch-icon", href: "/apple-touch-icon.png" }],
  ];
  headTags.forEach(([tag, attrs]) => {
    const key = attrs.name || attrs.rel;
    const selector = attrs.name ? `meta[name="${key}"]` : `link[rel="${key}"]`;
    const el = document.head.querySelector(selector) || document.head.appendChild(document.createElement(tag));
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  });
  if (!document.title) document.title = "Gadget Brust";
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
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.canvas },
                    // iOS-style push on both platforms, with swipe-back
                    animation: "ios_from_right",
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                  }}
                >
                  {/* sign-in screens rise from the bottom like a sheet */}
                  <Stack.Screen name="login" options={{ animation: "slide_from_bottom" }} />
                  <Stack.Screen name="register" options={{ animation: "slide_from_bottom" }} />
                  {/* checkout feels like a focused task */}
                  <Stack.Screen name="checkout" options={{ animation: "slide_from_bottom" }} />
                  {/* gateway return is an in-between step, so just fade */}
                  <Stack.Screen name="payment-result" options={{ animation: "fade", gestureEnabled: false }} />
                </Stack>
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
