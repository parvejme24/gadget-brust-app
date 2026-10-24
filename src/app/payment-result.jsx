import React, { useEffect } from "react";
import { ActivityIndicator, SafeAreaView, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { recentOrders } from "@/lib/recentOrders";
import AppBackground from "@/components/AppBackground";
import tw from "@/lib/tw";
import { colors } from "@/theme";

// Closes the in-app browser's auth session when this page loads inside it (web popup case)
WebBrowser.maybeCompleteAuthSession();

// Where SSLCommerz / Stripe send the shopper back. The status here is only a hint:
// the tracking screen re-reads the order, which the server has already verified with the gateway.
export default function PaymentResultScreen() {
  const router = useRouter();
  const { order, status } = useLocalSearchParams();

  useEffect(() => {
    const number = typeof order === "string" ? order : "";
    recentOrders.find(number).then((saved) => {
      if (saved?.phone) {
        router.replace({
          pathname: "/track",
          params: {
            number,
            phone: saved.phone,
            placed: "1",
            ...(status !== "paid" ? { payError: status === "cancelled" ? "Payment was cancelled." : "Payment didn't go through." } : {}),
          },
        });
      } else {
        router.replace("/track");
      }
    });
  }, [order, status, router]);

  return (
    <SafeAreaView style={tw("flex-1 items-center justify-center bg-canvas")}>
      <AppBackground />
      <ActivityIndicator color={colors.brand} size="large" />
      <Text style={tw("text-xs font-semibold text-gray-500 mt-3")}>Checking your payment…</Text>
    </SafeAreaView>
  );
}
