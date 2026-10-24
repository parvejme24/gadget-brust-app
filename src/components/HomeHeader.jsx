import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSelector } from "react-redux";
import { Bell, Search, ShieldCheck, ShoppingCart, SlidersHorizontal } from "lucide-react-native";
import GadgetLogo from "@/components/GadgetLogo";
import HeroBackground from "@/components/HeroBackground";
import { useNotifications } from "@/hooks/useStorefront";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const HERO_RADIUS = 28;
const SEARCH_HEIGHT = 52;

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

function GlassButton({ onPress, children, badge }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        {
          width: 42,
          height: 42,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.14)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.22)",
        },
        tw("cursor-pointer"),
        pressed && { transform: [{ scale: 0.9 }], backgroundColor: "rgba(255,255,255,0.24)" },
      ]}
    >
      {children}
      {badge}
    </Pressable>
  );
}

export default function HomeHeader({ searchQuery, onChangeSearch, onOpenNotifications, onOpenCart, onOpenFilters }) {
  const [hero, setHero] = useState({ width: 0, height: 0 });
  const [greeting] = useState(getGreeting);
  const user = useSelector((s) => s.auth?.user);
  const cartCount = useSelector((s) => (s.shop?.cart || []).reduce((sum, i) => sum + (i.qty || 1), 0));
  const { data: notifications = [] } = useNotifications();

  const unreadCount = useMemo(
    () => (Array.isArray(notifications) ? notifications.filter((n) => !n.read && !n.isRead).length : 0),
    [notifications]
  );
  const firstName = user?.name?.trim().split(" ")[0];

  return (
    <View style={{ marginBottom: SEARCH_HEIGHT / 2 + 6 }}>
      <View
        onLayout={(e) => setHero({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
        style={{
          borderBottomLeftRadius: HERO_RADIUS,
          borderBottomRightRadius: HERO_RADIUS,
          overflow: "hidden",
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: SEARCH_HEIGHT / 2 + 18,
        }}
      >
        <HeroBackground id="home-hero" width={hero.width} height={hero.height} />

        {/* Logo + actions */}
        <View style={tw("flex-row items-center justify-between")}>
          <View style={tw("flex-row items-center gap-2")}>
            <GadgetLogo width={112} height={40} dark />
            <View
              style={[
                tw("flex-row items-center gap-1 px-2 py-0.5 rounded-full"),
                { backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
              ]}
            >
              <ShieldCheck size={10} color="#a7f3d0" strokeWidth={2.6} />
              <Text style={[tw("font-black"), { fontSize: 9, color: "#d1fae5", letterSpacing: 0.8 }]}>OFFICIAL</Text>
            </View>
          </View>

          <View style={tw("flex-row items-center gap-2")}>
            <GlassButton
              onPress={onOpenCart}
              badge={
                cartCount > 0 && (
                  <View
                    style={[
                      tw("absolute items-center justify-center rounded-full"),
                      { top: -5, right: -5, minWidth: 18, height: 18, paddingHorizontal: 4, backgroundColor: "#ff6e06", borderWidth: 2, borderColor: "#1f6f52" },
                    ]}
                  >
                    <Text style={[tw("text-white font-black"), { fontSize: 9 }]}>{cartCount > 99 ? "99+" : cartCount}</Text>
                  </View>
                )
              }
            >
              <ShoppingCart size={19} color="#fff" strokeWidth={2.2} />
            </GlassButton>

            <GlassButton
              onPress={onOpenNotifications}
              badge={
                unreadCount > 0 && (
                  <View
                    style={[
                      tw("absolute rounded-full"),
                      { top: 9, right: 10, width: 9, height: 9, backgroundColor: colors.red500, borderWidth: 2, borderColor: "#1f6f52" },
                    ]}
                  />
                )
              }
            >
              <Bell size={19} color="#fff" strokeWidth={2.2} />
            </GlassButton>
          </View>
        </View>

        {/* Greeting */}
        <View style={tw("mt-4")}>
          <Text style={[tw("font-medium"), { fontSize: 13, color: "rgba(255,255,255,0.75)" }]}>
            {greeting}
            {firstName ? `, ${firstName}` : ""} 👋
          </Text>
          <Text style={[tw("text-white font-black mt-0.5"), { fontSize: 22, lineHeight: 28 }]}>
            Find your next <Text style={{ color: "#ffb46b" }}>favourite gadget</Text>
          </Text>
        </View>
      </View>

      {/* Search floats over the hero's bottom edge */}
      <View
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: -SEARCH_HEIGHT / 2,
          height: SEARCH_HEIGHT,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingLeft: 16,
          paddingRight: 6,
          borderRadius: 18,
          // solid: it overlaps the green hero, which would show through glass
          backgroundColor: "#ffffff",
          borderColor: colors.glassBorder,
          shadowColor: "#0f3d2e",
          shadowOpacity: 0.16,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
        }}
      >
        <Search size={19} color={colors.gray400} strokeWidth={2.2} />
        <TextInput
          placeholder="Search laptops, phones, earbuds..."
          placeholderTextColor={colors.gray400}
          value={searchQuery}
          onChangeText={onChangeSearch}
          returnKeyType="search"
          style={tw("flex-1 text-sm text-gray-900 p-0 font-medium")}
        />
        <Pressable
          onPress={onOpenFilters}
          style={({ pressed }) => [
            { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.brand },
            tw("cursor-pointer"),
            pressed && { transform: [{ scale: 0.9 }] },
          ]}
        >
          <SlidersHorizontal size={17} color="#fff" strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );
}
