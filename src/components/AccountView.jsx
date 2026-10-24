import React, { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import BlurBackdrop from "@/components/BlurBackdrop";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import {
  BadgeCheck,
  ChevronRight,
  Heart,
  HelpCircle,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Package,
  PackageSearch,
  Phone,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react-native";
import { authService } from "@/services/authService";
import { useMyOrders } from "@/hooks/useStorefront";
import AuthModal from "./AuthModal";
import GadgetLogo from "./GadgetLogo";
import HeroBackground from "./HeroBackground";
import { NAV_SPACE } from "./BottomNav";
import tw from "@/lib/tw";
import { colors } from "@/theme";
import { ORDER_STATUS } from "@/lib/orderStatus";

export default function AccountView({ onOpenWishlist, onOpenCart }) {
  const user = useSelector((s) => s.auth?.user);
  const cart = useSelector((s) => s.shop?.cart || []);
  const wishlist = useSelector((s) => s.shop?.wishlist || []);

  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [ordersModalVisible, setOrdersModalVisible] = useState(false);
  const router = useRouter();
  const [hero, setHero] = useState({ width: 0, height: 0 });

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
        status: inv.orderStatus || "pending",
        phone: inv.phone || inv.customer?.phone,
        items: (inv.items || []).map((it) => it.product?.title || it.title || "Gadget").join(", ") || "Gadget order",
        total: inv.grandTotal || inv.total || 0,
      }));
    }
    return [];
  }, [apiOrders]);

  const cartCount = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
  const initials = (user?.name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  const stats = [
    { key: "orders", label: "Orders", value: user ? displayOrders.length : 0, icon: Package, color: colors.brandDark, bg: colors.brandLight, onPress: () => setOrdersModalVisible(true) },
    { key: "wishlist", label: "Wishlist", value: wishlist.length, icon: Heart, color: colors.red500, bg: "#fee2e2", onPress: onOpenWishlist },
    { key: "cart", label: "In Cart", value: cartCount, icon: ShoppingBag, color: "#2563eb", bg: "#dbeafe", onPress: onOpenCart },
  ];

  const menuGroups = [
    {
      title: "Shopping",
      items: [
        { label: "My Orders & Invoices", desc: "Track delivery & past receipts", icon: Package, color: colors.brandDark, bg: colors.brandLight, onPress: () => setOrdersModalVisible(true) },
        { label: "Track an Order", desc: "Order number + phone, works for guest orders too", icon: PackageSearch, color: "#6d28d9", bg: "#ede9fe", onPress: () => router.push("/track") },
        { label: "Saved Delivery Addresses", desc: "Home, office & other places you ship to", icon: MapPin, color: "#2563eb", bg: "#dbeafe", onPress: () => router.push("/addresses") },
        { label: "My Wishlist", desc: `${wishlist.length} saved gadgets`, icon: Heart, color: colors.red500, bg: "#fee2e2", onPress: onOpenWishlist },
      ],
    },
    {
      title: "Support",
      items: [
        { label: "Genuine Warranty & Claims", desc: "Official brand service coverage", icon: ShieldCheck, color: "#7c3aed", bg: "#ede9fe", onPress: () => router.push("/support") },
        { label: "Help & Support", desc: "Call, WhatsApp, email or send us a message", icon: HelpCircle, color: "#d97706", bg: "#fef3c7", onPress: () => router.push("/support") },
      ],
    },
  ];

  return (
    <ScrollView style={tw("flex-1 bg-canvas")} contentContainerStyle={{ paddingBottom: NAV_SPACE }} showsVerticalScrollIndicator={false}>
      {/* Profile hero */}
      <View
        onLayout={(e) => setHero({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
        style={{ borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 64 }}
      >
        <HeroBackground id="account-hero" width={hero.width} height={hero.height} />

        <Text style={[tw("font-bold"), { fontSize: 12, color: "rgba(255,255,255,0.7)", letterSpacing: 1 }]}>MY ACCOUNT</Text>

        {user ? (
          <View style={tw("flex-row items-center gap-4 mt-4")}>
            <View style={{ padding: 3, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.18)" }}>
              <View style={[tw("items-center justify-center bg-white"), { width: 64, height: 64, borderRadius: 32 }]}>
                <Text style={[tw("font-black text-brand-dark"), { fontSize: 22 }]}>{initials}</Text>
              </View>
            </View>
            <View style={tw("flex-1")}>
              <View style={tw("flex-row items-center gap-1.5")}>
                <Text numberOfLines={1} style={[tw("text-white font-black"), { fontSize: 19, flexShrink: 1 }]}>
                  {user.name}
                </Text>
                <BadgeCheck size={17} color="#a7f3d0" strokeWidth={2.4} />
              </View>
              <View style={tw("flex-row items-center gap-1.5 mt-1")}>
                <Mail size={12} color="rgba(255,255,255,0.75)" />
                <Text numberOfLines={1} style={[tw("text-xs font-medium"), { color: "rgba(255,255,255,0.85)", flexShrink: 1 }]}>
                  {user.email}
                </Text>
              </View>
              {!!user.phone && (
                <View style={tw("flex-row items-center gap-1.5 mt-0.5")}>
                  <Phone size={12} color="rgba(255,255,255,0.75)" />
                  <Text style={[tw("text-xs font-medium"), { color: "rgba(255,255,255,0.85)" }]}>{user.phone}</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={tw("mt-4")}>
            <GadgetLogo width={118} height={42} dark />
            <Text style={[tw("text-white font-black mt-3"), { fontSize: 20 }]}>Hello, Guest 👋</Text>
            <Text style={[tw("text-xs font-medium mt-1"), { color: "rgba(255,255,255,0.8)" }]}>
              Sign in to sync your cart, wishlist and orders across devices.
            </Text>
            <Pressable
              onPress={() => setAuthModalVisible(true)}
              style={({ pressed }) => [
                tw("self-start flex-row items-center gap-1.5 bg-white px-4 py-2.5 rounded-full mt-4 cursor-pointer"),
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <LogIn size={15} color={colors.brandDark} strokeWidth={2.4} />
              <Text style={tw("text-xs font-extrabold text-brand-dark")}>Sign In / Create Account</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Stats card floats over the hero edge */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 16,
          marginTop: -40,
          paddingVertical: 14,
          borderRadius: 20,
          // solid: it overlaps the green hero, which would show through glass
          backgroundColor: "#ffffff",
          borderColor: colors.glassBorder,
          shadowColor: "#0f3d2e",
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
        }}
      >
        {stats.map(({ key, label, value, icon: Icon, color, bg, onPress }, idx) => (
          <Pressable
            key={key}
            onPress={onPress}
            style={({ pressed }) => [
              tw("flex-1 items-center cursor-pointer"),
              idx > 0 && { borderLeftWidth: 1, borderLeftColor: colors.gray100 },
              pressed && { opacity: 0.6 },
            ]}
          >
            <View style={[tw("items-center justify-center"), { width: 36, height: 36, borderRadius: 12, backgroundColor: bg }]}>
              <Icon size={17} color={color} strokeWidth={2.3} />
            </View>
            <Text style={[tw("font-black text-gray-900 mt-1.5"), { fontSize: 17 }]}>
              {key === "orders" && ordersLoading ? "–" : value}
            </Text>
            <Text style={[tw("font-semibold text-gray-500"), { fontSize: 11 }]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Menu groups */}
      <View style={tw("px-4 mt-5 gap-5")}>
        {menuGroups.map((group) => (
          <View key={group.title}>
            <Text style={[tw("font-extrabold text-gray-500 mb-2 ml-1"), { fontSize: 11, letterSpacing: 1 }]}>
              {group.title.toUpperCase()}
            </Text>
            <View style={tw("glass rounded-2xl overflow-hidden")}>
              {group.items.map(({ label, desc, icon: Icon, color, bg, onPress }, idx) => (
                <Pressable
                  key={label}
                  onPress={onPress}
                  style={({ pressed }) => [
                    tw("flex-row items-center gap-3 px-3.5 py-3 cursor-pointer"),
                    idx > 0 && { borderTopWidth: 1, borderTopColor: colors.gray50 },
                    pressed && { backgroundColor: colors.gray50 },
                  ]}
                >
                  <View style={[tw("items-center justify-center"), { width: 38, height: 38, borderRadius: 12, backgroundColor: bg }]}>
                    <Icon size={18} color={color} strokeWidth={2.2} />
                  </View>
                  <View style={tw("flex-1")}>
                    <Text style={tw("text-xs font-bold text-gray-900")}>{label}</Text>
                    <Text numberOfLines={1} style={[tw("text-gray-500 font-medium mt-0.5"), { fontSize: 11 }]}>
                      {desc}
                    </Text>
                  </View>
                  <View style={[tw("items-center justify-center rounded-full"), { width: 26, height: 26, backgroundColor: colors.gray50 }]}>
                    <ChevronRight size={15} color={colors.gray500} strokeWidth={2.4} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Sign out (signed in only — guests sign in from the hero) */}
        {user && (
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              tw("flex-row items-center justify-center gap-2 glass py-3.5 rounded-2xl border-red-200 cursor-pointer"),
              pressed && { backgroundColor: "#fef2f2" },
            ]}
          >
            <LogOut size={16} color={colors.red500} />
            <Text style={tw("text-xs font-bold text-red-600")}>Sign Out</Text>
          </Pressable>
        )}

        <Text style={[tw("text-center text-gray-400 font-medium"), { fontSize: 11 }]}>
          Gadget Brust · Version {Constants.expoConfig?.version || "1.0.0"}
        </Text>
      </View>

      {/* Orders Modal */}
      <Modal visible={ordersModalVisible} animationType="fade" transparent statusBarTranslucent onRequestClose={() => setOrdersModalVisible(false)}>
        {/* Outer wrapper */}
        <View style={tw("flex-1 justify-end items-center")}>
          {/* Backdrop: soft blur over the screen behind; tap to close */}
          <BlurBackdrop onPress={() => setOrdersModalVisible(false)} />
          <Animated.View
            entering={SlideInDown.springify().damping(18).stiffness(160)}
            style={[
              tw("w-full glass-strong rounded-t-3xl p-6 border-t border-gray-100 shadow-2xl max-h-5/6"),
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
                  <Pressable
                    key={ord.id}
                    onPress={() => {
                      if (!ord.phone) return;
                      setOrdersModalVisible(false);
                      router.push({ pathname: "/track", params: { number: ord.id, phone: ord.phone } });
                    }}
                    style={({ pressed }) => [tw("p-4 bg-gray-50 rounded-2xl border border-gray-200 gap-2 cursor-pointer"), pressed && { opacity: 0.7 }]}
                  >
                    <View style={tw("flex-row justify-between items-center")}>
                      <Text style={tw("text-xs font-extrabold text-gray-900")}>Order #{ord.id}</Text>
                      <View style={[tw("px-2 py-0.5 rounded-full"), { backgroundColor: (ORDER_STATUS[ord.status] || ORDER_STATUS.pending).bg }]}>
                        <Text style={[tw("text-xs font-bold"), { color: (ORDER_STATUS[ord.status] || ORDER_STATUS.pending).color }]}>
                          {(ORDER_STATUS[ord.status] || ORDER_STATUS.pending).label}
                        </Text>
                      </View>
                    </View>
                    <Text style={tw("text-xs text-gray-700 font-semibold")}>{ord.items}</Text>
                    <View style={tw("flex-row justify-between items-center mt-1 pt-2 border-t border-gray-200")}>
                      <Text style={tw("text-xs text-gray-400")}>{ord.date}</Text>
                      <Text style={tw("text-sm font-extrabold text-brand")}>৳{ord.total.toLocaleString()}</Text>
                    </View>
                    <View style={tw("flex-row items-center gap-1")}>
                      <PackageSearch size={12} color={colors.brandDark} />
                      <Text style={[tw("font-bold text-brand-dark"), { fontSize: 11 }]}>Tap to track this order</Text>
                    </View>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Auth Modal */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
    </ScrollView>
  );
}
