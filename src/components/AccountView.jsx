import React, { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSelector } from "react-redux";
import {
  ChevronRight,
  Heart,
  HelpCircle,
  LogIn,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react-native";
import { authService } from "@/services/authService";
import { useMyOrders } from "@/hooks/useStorefront";
import AuthModal from "./AuthModal";
import GadgetLogo from "./GadgetLogo";
import tw from "@/lib/tw";
import { colors } from "@/theme";

export default function AccountView({ onOpenWishlist, onOpenCart }) {
  const user = useSelector((s) => s.auth?.user);
  const cart = useSelector((s) => s.shop?.cart || []);
  const wishlist = useSelector((s) => s.shop?.wishlist || []);

  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [ordersModalVisible, setOrdersModalVisible] = useState(false);

  // Load live orders from /api/invoices/mine when user is logged in
  const { data: apiOrders = [], isLoading: ordersLoading } = useMyOrders(Boolean(user));

  const handleSignOut = async () => {
    await authService.logout();
  };

  const displayOrders = useMemo(() => {
    if (apiOrders && Array.isArray(apiOrders) && apiOrders.length > 0) {
      return apiOrders.map((inv) => ({
        id: inv.invoiceNumber || inv.invoiceNo || inv._id?.slice(-6) || "INV",
        date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "Recent",
        status: inv.orderStatus || inv.status || "Processing",
        items: (inv.items || []).map((it) => it.product?.title || it.title || "Gadget").join(", ") || "Gadget order",
        total: inv.grandTotal || inv.total || 0,
      }));
    }
    return [];
  }, [apiOrders]);

  return (
    <ScrollView style={tw("flex-1 bg-canvas")} contentContainerStyle={tw("pb-24")}>
      {/* Profile Header */}
      <View style={tw("bg-surface p-5 border-b border-gray-100")}>
        {user ? (
          <View style={tw("flex-row items-center gap-4")}>
            <View style={tw("w-16 h-16 rounded-full bg-emerald-50 border-2 border-brand items-center justify-center")}>
              <Text style={tw("text-xl font-extrabold text-brand")}>
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <View style={tw("flex-1")}>
              <View style={tw("flex-row items-center gap-2")}>
                <Text style={tw("text-base font-extrabold text-gray-900")}>{user.name}</Text>
                <View style={tw("bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200")}>
                  <Text style={tw("text-emerald-700 text-xs font-bold")}>Verified</Text>
                </View>
              </View>
              <Text style={tw("text-xs text-gray-500 mt-0.5")}>{user.email}</Text>
              {!!user.phone && <Text style={tw("text-xs text-gray-400 mt-0.5")}>{user.phone}</Text>}
            </View>
          </View>
        ) : (
          <View style={tw("flex-row items-center justify-between")}>
            <View style={tw("flex-row items-center gap-3")}>
              <GadgetLogo width={92} height={33} />
              <View style={tw("border-l border-gray-200 pl-2.5")}>
                <Text style={tw("text-sm font-extrabold text-gray-900")}>Hello, Guest</Text>
                <Text style={tw("text-[11px] text-gray-500")}>Sign in to sync cart & orders</Text>
              </View>
            </View>
            <Pressable
              onPress={() => setAuthModalVisible(true)}
              style={({ pressed }) => [
                tw("flex-row items-center gap-1.5 bg-brand px-3.5 py-1.5 rounded-full shadow-sm cursor-pointer"),
                pressed && { opacity: 0.8 },
              ]}
            >
              <LogIn size={14} color="white" />
              <Text style={tw("text-white text-xs font-bold")}>Sign In</Text>
            </Pressable>
          </View>
        )}

        {/* Quick Stats Grid */}
        <View style={tw("flex-row gap-2 mt-5")}>
          <Pressable
            onPress={() => setOrdersModalVisible(true)}
            style={({ pressed }) => [
              tw("flex-1 bg-gray-50 p-3 rounded-2xl border border-gray-100 items-center cursor-pointer"),
              pressed && { opacity: 0.8 },
            ]}
          >
            <Package size={18} color={colors.brand} />
            <Text style={tw("text-sm font-extrabold text-gray-900 mt-1")}>2 Orders</Text>
            <Text style={tw("text-xs text-gray-500")}>Track recent</Text>
          </Pressable>

          <Pressable
            onPress={onOpenWishlist}
            style={({ pressed }) => [
              tw("flex-1 bg-gray-50 p-3 rounded-2xl border border-gray-100 items-center cursor-pointer"),
              pressed && { opacity: 0.8 },
            ]}
          >
            <Heart size={18} color={colors.red500} />
            <Text style={tw("text-sm font-extrabold text-gray-900 mt-1")}>{wishlist.length} Items</Text>
            <Text style={tw("text-xs text-gray-500")}>In Wishlist</Text>
          </Pressable>

          <Pressable
            onPress={onOpenCart}
            style={({ pressed }) => [
              tw("flex-1 bg-gray-50 p-3 rounded-2xl border border-gray-100 items-center cursor-pointer"),
              pressed && { opacity: 0.8 },
            ]}
          >
            <ShoppingBag size={18} color={colors.brandDark} />
            <Text style={tw("text-sm font-extrabold text-gray-900 mt-1")}>
              {cart.reduce((sum, i) => sum + i.qty, 0)} Items
            </Text>
            <Text style={tw("text-xs text-gray-500")}>In Cart</Text>
          </Pressable>
        </View>
      </View>

      {/* Menu Options */}
      <View style={tw("mt-3 px-4 gap-3")}>
        {/* Orders Card */}
        <View style={tw("bg-surface rounded-2xl p-2 border border-gray-100 shadow-sm")}>
          <Pressable
            onPress={() => setOrdersModalVisible(true)}
            style={({ pressed }) => [
              tw("flex-row items-center justify-between p-3 cursor-pointer"),
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={tw("flex-row items-center gap-3")}>
              <View style={tw("w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center")}>
                <Package size={18} color={colors.brand} />
              </View>
              <View>
                <Text style={tw("text-xs font-bold text-gray-900")}>My Orders & Invoices</Text>
                <Text style={tw("text-xs text-gray-400")}>Check delivery status & past receipts</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.gray400} />
          </Pressable>

          <View style={tw("h-px bg-gray-100 mx-3")} />

          <Pressable
            style={({ pressed }) => [
              tw("flex-row items-center justify-between p-3 cursor-pointer"),
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={tw("flex-row items-center gap-3")}>
              <View style={tw("w-9 h-9 rounded-xl bg-blue-50 items-center justify-center")}>
                <MapPin size={18} color="#2563eb" />
              </View>
              <View>
                <Text style={tw("text-xs font-bold text-gray-900")}>Saved Delivery Addresses</Text>
                <Text style={tw("text-xs text-gray-400")}>Dhaka, Chittagong, Sylhet</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.gray400} />
          </Pressable>
        </View>

        {/* Services & Warranty Card */}
        <View style={tw("bg-surface rounded-2xl p-2 border border-gray-100 shadow-sm")}>
          <Pressable
            style={({ pressed }) => [
              tw("flex-row items-center justify-between p-3 cursor-pointer"),
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={tw("flex-row items-center gap-3")}>
              <View style={tw("w-9 h-9 rounded-xl bg-purple-50 items-center justify-center")}>
                <ShieldCheck size={18} color="#7c3aed" />
              </View>
              <View>
                <Text style={tw("text-xs font-bold text-gray-900")}>Genuine Warranty & Claims</Text>
                <Text style={tw("text-xs text-gray-400")}>Official brand service coverage</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.gray400} />
          </Pressable>

          <View style={tw("h-px bg-gray-100 mx-3")} />

          <Pressable
            style={({ pressed }) => [
              tw("flex-row items-center justify-between p-3 cursor-pointer"),
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={tw("flex-row items-center gap-3")}>
              <View style={tw("w-9 h-9 rounded-xl bg-amber-50 items-center justify-center")}>
                <HelpCircle size={18} color={colors.amber500} />
              </View>
              <View>
                <Text style={tw("text-xs font-bold text-gray-900")}>24/7 Helpline & Support</Text>
                <Text style={tw("text-xs text-gray-400")}>Chat with our technical experts</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.gray400} />
          </Pressable>
        </View>

        {/* Sign In / Sign Out Button */}
        {user ? (
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              tw("flex-row items-center justify-center gap-2 bg-red-50 py-3.5 rounded-2xl border border-red-200 cursor-pointer mt-2"),
              pressed && { opacity: 0.8 },
            ]}
          >
            <LogOut size={16} color={colors.red500} />
            <Text style={tw("text-xs font-bold text-red-600")}>Sign Out of Gadget Brust</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setAuthModalVisible(true)}
            style={({ pressed }) => [
              tw("flex-row items-center justify-center gap-2 bg-brand py-3.5 rounded-2xl shadow-sm cursor-pointer mt-2"),
              pressed && { opacity: 0.9 },
            ]}
          >
            <LogIn size={16} color="white" />
            <Text style={tw("text-xs font-bold text-white")}>Sign In to Your Account</Text>
          </Pressable>
        )}
      </View>

      {/* Orders Modal */}
      <Modal visible={ordersModalVisible} animationType="slide" transparent>
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
            onPress={() => setOrdersModalVisible(false)}
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

            <View style={tw("flex-row justify-between items-center mb-4")}>
              <Text style={tw("text-lg font-extrabold text-gray-900")}>My Orders</Text>
              <Pressable
                onPress={() => setOrdersModalVisible(false)}
                style={tw("w-8 h-8 rounded-full bg-gray-100 items-center justify-center cursor-pointer")}
              >
                <X size={18} color={colors.gray600} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw("gap-3")}>
              {ordersLoading ? (
                <View style={tw("py-8 items-center justify-center")}>
                  <ActivityIndicator size="small" color={colors.brand} />
                  <Text style={tw("text-xs text-gray-400 mt-2 font-medium")}>Loading your orders...</Text>
                </View>
              ) : !user ? (
                <View style={tw("py-8 items-center justify-center gap-3")}>
                  <Package size={36} color={colors.gray400} />
                  <Text style={tw("text-sm font-bold text-gray-800")}>Sign in to view orders</Text>
                  <Text style={tw("text-xs text-gray-500 text-center max-w-xs")}>
                    Please sign in to your Gadget Brust account to track orders and delivery status.
                  </Text>
                  <Pressable
                    onPress={() => {
                      setOrdersModalVisible(false);
                      setAuthModalVisible(true);
                    }}
                    style={tw("mt-2 bg-brand px-5 py-2.5 rounded-xl")}
                  >
                    <Text style={tw("text-xs font-bold text-white")}>Sign In Now</Text>
                  </Pressable>
                </View>
              ) : displayOrders.length === 0 ? (
                <View style={tw("py-8 items-center justify-center gap-2")}>
                  <Package size={36} color={colors.gray400} />
                  <Text style={tw("text-sm font-bold text-gray-800")}>No orders yet</Text>
                  <Text style={tw("text-xs text-gray-500 text-center")}>
                    Your completed orders from Gadget Brust will appear here.
                  </Text>
                </View>
              ) : (
                displayOrders.map((ord) => (
                  <View key={ord.id} style={tw("p-4 bg-gray-50 rounded-2xl border border-gray-200 gap-2")}>
                    <View style={tw("flex-row justify-between items-center")}>
                      <Text style={tw("text-xs font-extrabold text-gray-900")}>Order #{ord.id}</Text>
                      <View style={tw("bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200")}>
                        <Text style={tw("text-xs font-bold text-emerald-700")}>{ord.status}</Text>
                      </View>
                    </View>
                    <Text style={tw("text-xs text-gray-700 font-semibold")}>{ord.items}</Text>
                    <View style={tw("flex-row justify-between items-center mt-1 pt-2 border-t border-gray-200")}>
                      <Text style={tw("text-xs text-gray-400")}>{ord.date}</Text>
                      <Text style={tw("text-sm font-extrabold text-brand")}>৳{ord.total.toLocaleString()}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Store Footer Branding */}
      <View style={tw("items-center justify-center py-6 gap-1.5 opacity-80")}>
        <GadgetLogo width={85} height={30} />
        <Text style={tw("text-[11px] font-semibold text-gray-400")}>
          v1.0.0 • 100% Genuine Warranty
        </Text>
      </View>

      {/* Auth Modal */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
    </ScrollView>
  );
}
