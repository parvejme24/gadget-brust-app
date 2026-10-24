import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { orderService } from "@/services/orderService";

const isWeb = Platform.OS === "web";

// Where the server sends the browser after the gateway (handled by src/app/payment-result.jsx)
const returnUrl = () =>
  isWeb && typeof window !== "undefined" ? `${window.location.origin}/payment-result` : Linking.createURL("payment-result");

/**
 * Open the SSLCommerz / Stripe hosted page for an order.
 * Native: in-app browser that closes itself on return; resolves with the order as the server now sees it.
 * Web: navigates away; /payment-result picks up from there.
 */
export async function payOrder({ number, phone, method }) {
  const { paymentUrl } = await orderService.startPayment({ invoiceNumber: number, phone, method, returnUrl: returnUrl() });

  if (isWeb) {
    window.location.assign(paymentUrl);
    return null;
  }

  await WebBrowser.openAuthSessionAsync(paymentUrl, returnUrl());
  // The redirect only says what the browser saw; the server's record is the source of truth
  return orderService.track({ number, phone });
}
