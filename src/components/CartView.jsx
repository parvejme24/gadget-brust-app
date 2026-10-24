import React, { useState } from "react";
import { ActivityIndicator, FlatList, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import {
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  Tag,
  Trash2,
  X,
} from "lucide-react-native";
import { clearCart, removeFromCart, updateCartQty } from "@/store/slices/shopSlice";
import { storefrontService } from "@/services/storefrontService";
import ErrorState from "./ErrorState";
import { formatTaka, getFinalPrice } from "@/lib/format";
import tw from "@/lib/tw";
import { colors } from "@/theme";

export default function CartView({ onExplore, onCheckoutAuthPrompt }) {
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.shop?.cart || []);
  const user = useSelector((s) => s.auth?.user);

  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + getFinalPrice(item) * item.qty, 0);
  const shippingFee = subtotal >= 5000 || subtotal === 0 ? 0 : 120;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === "GADGET10" || code === "WELCOME") {
      setDiscountPercent(10);
      setPromoMessage("10% Discount Applied! 🎉");
    } else if (code === "BRUST20") {
      setDiscountPercent(20);
      setPromoMessage("20% Flash Voucher Applied! 🔥");
    } else {
      setDiscountPercent(0);
      setPromoMessage("Invalid promo code. Try 'GADGET10'");
    }
  };

  const handleConfirmOrder = async () => {
    setSubmittingOrder(true);
    try {
      const res = await storefrontService.createOrder({
        customer: {
          name: user?.name || "Customer",
          phone: user?.phone || "01711223344",
          email: user?.email || "customer@example.com",
        },
        shippingAddress: {
          street: "Dhanmondi, Road 27",
          city: "Dhaka",
          state: "Dhaka",
          zipCode: "1209",
          country: "Bangladesh",
        },
        shippingMethod: "standard",
        paymentMethod: "cod",
        couponCode: promoCode || undefined,
        items: cart.map((it) => ({
          product: it._id,
          quantity: it.qty,
        })),
      });

      if (res) {
        setOrderPlaced(true);
        setTimeout(() => {
          dispatch(clearCart());
          setShowCheckoutModal(false);
          setOrderPlaced(false);
        }, 2000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to place order";
      alert(msg);
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <View style={tw("flex-1 items-center justify-center p-6 bg-canvas")}>
        <ErrorState
          type="empty-cart"
          onAction={onExplore}
        />
      </View>
    );
  }

  return (
    <View style={tw("flex-1 bg-canvas")}>
      {/* Header */}
      <View style={tw("p-4 bg-surface border-b border-gray-100 flex-row items-center justify-between")}>
        <View>
          <Text style={tw("text-lg font-extrabold text-gray-900")}>Shopping Cart</Text>
          <Text style={tw("text-xs text-gray-500")}>
            {cart.reduce((sum, i) => sum + i.qty, 0)} items in your cart
          </Text>
        </View>
        <Pressable
          onPress={() => dispatch(clearCart())}
          style={({ pressed }) => [
            tw("flex-row items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full cursor-pointer"),
            pressed && { opacity: 0.7 },
          ]}
        >
          <Trash2 size={13} color={colors.red500} />
          <Text style={tw("text-xs font-bold text-red-500")}>Clear</Text>
        </Pressable>
      </View>

      {/* Cart List */}
      <FlatList
        data={cart}
        keyExtractor={(item) => item._id}
        contentContainerStyle={tw("p-4 gap-3")}
        renderItem={({ item }) => {
          const price = getFinalPrice(item);
          return (
            <View style={tw("flex-row bg-surface p-3 rounded-2xl border border-gray-100 shadow-sm items-center gap-3")}>
              {/* Image */}
              <View style={tw("w-18 h-18 rounded-xl bg-gray-50 overflow-hidden items-center justify-center")}>
                <Image
                  source={item.image?.url}
                  style={tw("w-full h-full p-2")}
                  contentFit="contain"
                />
              </View>

              {/* Details */}
              <View style={tw("flex-1")}>
                <Text numberOfLines={1} style={tw("text-xs font-semibold text-gray-900")}>
                  {item.title}
                </Text>
                <Text style={tw("text-sm font-extrabold text-gray-900 mt-1")}>
                  {formatTaka(price)}
                </Text>

                {/* Quantity Controls */}
                <View style={tw("flex-row items-center gap-3 mt-2")}>
                  <View style={tw("flex-row items-center bg-gray-100 rounded-full px-2 py-1 gap-3")}>
                    <Pressable
                      onPress={() => {
                        if (item.qty > 1) {
                          dispatch(updateCartQty({ id: item._id, qty: item.qty - 1 }));
                        } else {
                          dispatch(removeFromCart(item._id));
                        }
                      }}
                      style={({ pressed }) => [tw("p-0.5 cursor-pointer"), pressed && { opacity: 0.6 }]}
                    >
                      <Minus size={13} color={colors.gray700} />
                    </Pressable>

                    <Text style={tw("text-xs font-bold text-gray-900 min-w-6 text-center")}>
                      {item.qty}
                    </Text>

                    <Pressable
                      onPress={() => dispatch(updateCartQty({ id: item._id, qty: item.qty + 1 }))}
                      style={({ pressed }) => [tw("p-0.5 cursor-pointer"), pressed && { opacity: 0.6 }]}
                    >
                      <Plus size={13} color={colors.gray700} />
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={() => dispatch(removeFromCart(item._id))}
                    style={({ pressed }) => [tw("p-1.5 cursor-pointer"), pressed && { opacity: 0.6 }]}
                  >
                    <Trash2 size={15} color={colors.gray400} />
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
        ListFooterComponent={() => (
          <View style={tw("mt-2 gap-4 pb-24")}>
            {/* Promo Code Input */}
            <View style={tw("bg-surface p-4 rounded-2xl border border-gray-100 shadow-sm")}>
              <View style={tw("flex-row items-center gap-2 mb-2")}>
                <Tag size={16} color={colors.brand} />
                <Text style={tw("text-xs font-bold text-gray-900")}>Apply Promo Voucher</Text>
              </View>
              <View style={tw("flex-row items-center gap-2")}>
                <TextInput
                  placeholder="Enter code (e.g. GADGET10)"
                  placeholderTextColor={colors.gray400}
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                  style={tw("flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900")}
                />
                <Pressable
                  onPress={handleApplyPromo}
                  style={({ pressed }) => [
                    tw("bg-brand px-4 py-2 rounded-xl cursor-pointer"),
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={tw("text-white text-xs font-bold")}>Apply</Text>
                </Pressable>
              </View>
              {!!promoMessage && (
                <Text
                  style={[
                    tw("text-xs mt-2 font-semibold"),
                    discountPercent > 0 ? tw("text-emerald-600") : tw("text-red-500"),
                  ]}
                >
                  {promoMessage}
                </Text>
              )}
            </View>

            {/* Bill Summary */}
            <View style={tw("bg-surface p-4 rounded-2xl border border-gray-100 shadow-sm gap-2.5")}>
              <Text style={tw("text-sm font-bold text-gray-900 mb-1")}>Order Summary</Text>

              <View style={tw("flex-row justify-between")}>
                <Text style={tw("text-xs text-gray-500")}>Subtotal</Text>
                <Text style={tw("text-xs font-bold text-gray-900")}>{formatTaka(subtotal)}</Text>
              </View>

              <View style={tw("flex-row justify-between")}>
                <Text style={tw("text-xs text-gray-500")}>Shipping</Text>
                <Text style={tw("text-xs font-bold text-emerald-600")}>
                  {shippingFee === 0 ? "FREE" : formatTaka(shippingFee)}
                </Text>
              </View>

              {discountAmount > 0 && (
                <View style={tw("flex-row justify-between")}>
                  <Text style={tw("text-xs text-emerald-600")}>Discount ({discountPercent}%)</Text>
                  <Text style={tw("text-xs font-bold text-emerald-600")}>
                    -{formatTaka(discountAmount)}
                  </Text>
                </View>
              )}

              <View style={tw("h-px bg-gray-100 my-1")} />

              <View style={tw("flex-row justify-between items-baseline")}>
                <Text style={tw("text-sm font-extrabold text-gray-900")}>Total Payable</Text>
                <Text style={tw("text-lg font-extrabold text-brand")}>{formatTaka(grandTotal)}</Text>
              </View>

              <View style={tw("flex-row items-center gap-1.5 mt-2 bg-emerald-50 p-2 rounded-xl")}>
                <ShieldCheck size={14} color={colors.brand} />
                <Text style={tw("text-xs text-emerald-700 font-medium")}>
                  Genuine official warranty included on all items
                </Text>
              </View>

              {/* Checkout Button */}
              <Pressable
                onPress={() => setShowCheckoutModal(true)}
                style={({ pressed }) => [
                  tw("mt-4 flex-row items-center justify-center gap-2 bg-brand py-3.5 rounded-full shadow-md cursor-pointer"),
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={tw("text-white text-sm font-bold")}>Proceed to Checkout</Text>
                <ArrowRight size={16} color="white" />
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* Checkout Modal */}
      <Modal visible={showCheckoutModal} animationType="slide" transparent>
        {/* Outer wrapper */}
        <View style={tw("flex-1 justify-end items-center")}>
          {/* Dismiss Backdrop: frosted glass blur outside screen */}
          <Pressable
            style={[
              tw("absolute inset-0"),
              {
                backgroundColor: "rgba(0, 0, 0, 0.35)",
                ...(Platform.OS === "web"
                  ? {
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }
                  : {}),
              },
            ]}
            onPress={() => setShowCheckoutModal(false)}
          >
            <View style={[tw("w-full h-full bg-black bg-opacity-25 mx-auto"), { maxWidth: 480 }]} />
          </Pressable>
          <View
            style={[
              tw("w-full bg-surface rounded-t-3xl p-6 border-t border-gray-100 shadow-2xl max-h-5/6"),
              { maxWidth: 480 },
            ]}
          >
            {/* Drawer Handle Pill */}
            <View style={tw("w-12 h-1.5 rounded-full bg-gray-300 self-center mb-3")} />

            {orderPlaced ? (
              <View style={tw("items-center py-8 gap-3")}>
                <CheckCircle2 size={56} color={colors.brand} />
                <Text style={tw("text-xl font-extrabold text-gray-900 text-center")}>
                  Order Confirmed! 🎉
                </Text>
                <Text style={tw("text-xs text-gray-500 text-center")}>
                  Thank you for shopping with Gadget Brust. An invoice has been generated.
                </Text>
              </View>
            ) : (
              <View style={tw("gap-4")}>
                <View style={tw("flex-row justify-between items-center")}>
                  <Text style={tw("text-lg font-extrabold text-gray-900")}>Confirm Order</Text>
                  <Pressable
                    onPress={() => setShowCheckoutModal(false)}
                    style={tw("p-1 rounded-full bg-gray-100 cursor-pointer")}
                  >
                    <X size={18} color={colors.gray600} />
                  </Pressable>
                </View>

                {/* Delivery Info */}
                <View style={tw("bg-gray-50 p-3 rounded-2xl border border-gray-100 gap-1")}>
                  <Text style={tw("text-xs font-bold text-gray-900")}>
                    Delivery to: {user?.name || "Guest Customer"}
                  </Text>
                  <Text style={tw("text-xs text-gray-500")}>
                    {user?.phone || "+880 1711-223344"} • Dhanmondi, Dhaka, Bangladesh
                  </Text>
                  <Text style={tw("text-xs text-brand font-semibold mt-1")}>
                    Estimated delivery: 24 - 48 Hours
                  </Text>
                </View>

                <View style={tw("flex-row justify-between items-baseline")}>
                  <Text style={tw("text-sm font-bold text-gray-700")}>Total Amount</Text>
                  <Text style={tw("text-xl font-extrabold text-brand")}>
                    {formatTaka(grandTotal)}
                  </Text>
                </View>

                {/* Place Order CTA with Spinner */}
                <Pressable
                  onPress={handleConfirmOrder}
                  disabled={submittingOrder}
                  style={({ pressed }) => [
                    tw("bg-brand py-3.5 rounded-full items-center justify-center shadow-md cursor-pointer flex-row gap-2"),
                    pressed && { opacity: 0.9 },
                    submittingOrder && { opacity: 0.7 },
                  ]}
                >
                  {submittingOrder ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : null}
                  <Text style={tw("text-white text-sm font-bold")}>
                    {submittingOrder ? "Submitting Order..." : "Confirm Cash on Delivery"}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
