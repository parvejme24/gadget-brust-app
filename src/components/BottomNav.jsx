import React from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { Heart, Home, LayoutGrid, ShoppingBag, User } from "lucide-react-native";
import tw from "@/lib/tw";
import { colors } from "@/theme";

export default function BottomNav({ activeTab = "home", onSelectTab }) {
  const cart = useSelector((s) => s.shop?.cart || []);
  const wishlist = useSelector((s) => s.shop?.wishlist || []);
  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  const wishlistCount = wishlist.length;

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "explore", label: "Explore", icon: LayoutGrid },
    { id: "wishlist", label: "Wishlist", icon: Heart, badge: wishlistCount },
    { id: "cart", label: "Cart", icon: ShoppingBag, badge: cartCount },
    { id: "profile", label: "Account", icon: User },
  ];

  return (
    <View
      style={[
        tw("flex-row bg-surface border-t border-gray-100 py-1.5 shadow-lg"),
        { paddingBottom: Platform.OS === "ios" ? 20 : 6 },
      ]}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onSelectTab?.(tab.id)}
            style={({ pressed }) => [
              tw("flex-1 items-center justify-center py-1 cursor-pointer"),
              pressed && { transform: [{ scale: 0.92 }] },
            ]}
          >
            <View style={tw("relative p-0.5")}>
              <Icon
                size={22}
                color={isActive ? colors.brand : colors.gray400}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {!!tab.badge && tab.badge > 0 && (
                <View
                  style={[
                    tw(
                      "absolute rounded-full items-center justify-center border-2 border-white",
                      tab.id === "wishlist" ? "bg-red-500" : "bg-brand"
                    ),
                    {
                      top: -4,
                      right: -9,
                      minWidth: 18,
                      height: 18,
                      paddingHorizontal: tab.badge > 9 ? 4 : 0,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 10,
                      fontWeight: "800",
                      textAlign: "center",
                      includeFontPadding: false,
                      lineHeight: 12,
                    }}
                  >
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                tw("text-xs mt-0.5 font-medium"),
                isActive ? tw("text-brand font-bold") : tw("text-gray-500"),
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
