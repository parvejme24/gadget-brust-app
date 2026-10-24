import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import * as Haptics from "expo-haptics";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Heart, Home, LayoutGrid, ShoppingBag, User } from "lucide-react-native";
import GlassView from "@/components/GlassView";
import { colors } from "@/theme";

const isWeb = Platform.OS === "web";

const BAR_HEIGHT = 64;
const CIRCLE = 58;
const LIFT = 28; // how far the active icon rises into the floating disc
const BOTTOM_GAP = Platform.OS === "ios" ? 6 : 12;
const SPRING = { damping: 15, stiffness: 150, mass: 0.9 };

// Space screens leave at the bottom so their content can scroll under the floating bar
export const NAV_SPACE = CIRCLE / 2 + BAR_HEIGHT + BOTTOM_GAP + 12;

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "explore", label: "Explore", icon: LayoutGrid },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "cart", label: "Cart", icon: ShoppingBag },
  { id: "profile", label: "Account", icon: User },
];

function Badge({ count, color }) {
  return (
    // re-keyed by count so it pops each time the number changes
    <Animated.View
      key={count}
      entering={ZoomIn.springify().damping(10)}
      style={{
        position: "absolute",
        top: -7,
        right: -11,
        minWidth: 18,
        height: 18,
        paddingHorizontal: count > 9 ? 4 : 0,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: color,
        borderWidth: 2,
        borderColor: "#ffffff",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 9, fontWeight: "900", includeFontPadding: false, lineHeight: 11 }}>
        {count > 99 ? "99+" : count}
      </Text>
    </Animated.View>
  );
}

function TabButton({ tab, index, position, badge, onPress }) {
  const Icon = tab.icon;
  // t = 1 when this tab is active, easing to 0 as the indicator moves away
  const liftStyle = useAnimatedStyle(() => {
    const t = interpolate(Math.abs(position.get() - index), [0, 1], [1, 0], Extrapolation.CLAMP);
    return { transform: [{ translateY: -LIFT * t }, { scale: 1 + 0.1 * t }] };
  });
  // dark icon on the glass bar cross-fades to a white icon inside the green disc
  const darkIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(position.get() - index), [0, 0.5], [0, 1], Extrapolation.CLAMP),
  }));
  const lightIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(position.get() - index), [0, 0.5], [1, 0], Extrapolation.CLAMP),
  }));
  const labelStyle = useAnimatedStyle(() => {
    const t = interpolate(Math.abs(position.get() - index), [0, 0.6], [1, 0], Extrapolation.CLAMP);
    return { opacity: t, transform: [{ translateY: 6 * (1 - t) }] };
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      style={[{ flex: 1, height: BAR_HEIGHT, alignItems: "center", justifyContent: "center" }, isWeb && { cursor: "pointer" }]}
    >
      <Animated.View style={liftStyle}>
        <Animated.View style={darkIconStyle}>
          <Icon size={22} color={colors.gray600} strokeWidth={2.1} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, lightIconStyle]}>
          <Icon size={22} color="#ffffff" strokeWidth={2.5} fill={tab.id === "wishlist" ? "#ffffff" : "transparent"} />
        </Animated.View>
        {badge.count > 0 && <Badge count={badge.count} color={badge.color} />}
      </Animated.View>
      <Animated.Text
        numberOfLines={1}
        style={[{ position: "absolute", bottom: 8, color: colors.brandDark, fontSize: 11, fontWeight: "800", letterSpacing: 0.2 }, labelStyle]}
      >
        {tab.label}
      </Animated.Text>
    </Pressable>
  );
}

export default function BottomNav({ activeTab = "home", onSelectTab }) {
  const cart = useSelector((s) => s.shop?.cart || []);
  const wishlist = useSelector((s) => s.shop?.wishlist || []);
  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  const [width, setWidth] = useState(0);
  const activeIndex = Math.max(0, TABS.findIndex((t) => t.id === activeTab));
  const position = useSharedValue(activeIndex);
  const tabWidth = width / TABS.length;

  useEffect(() => {
    position.set(withSpring(activeIndex, SPRING));
  }, [activeIndex, position]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.get() * tabWidth + tabWidth / 2 - CIRCLE / 2 }],
  }));

  const badges = {
    wishlist: { count: wishlist.length, color: colors.red500 },
    cart: { count: cartCount, color: "#ff6e06" },
  };

  const select = (id) => {
    if (id !== activeTab && !isWeb) Haptics.selectionAsync().catch(() => {});
    onSelectTab?.(id);
  };

  return (
    // Floats over the screen so content scrolls (and blurs) behind the glass
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingTop: CIRCLE / 2, paddingBottom: BOTTOM_GAP }}
    >
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={{
          height: BAR_HEIGHT,
          borderRadius: 26,
          shadowColor: "#0f3d2e",
          shadowOpacity: 0.16,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 10 },
        }}
      >
        {/* Frosted glass bar */}
        <GlassView
          intensity={70}
          tint="rgba(255,255,255,0.42)"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 26, borderColor: "rgba(255,255,255,0.9)" }}
        />
        {/* Glossy sheen: brighter at the top edge, like light hitting glass */}
        {width > 0 && (
          <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 26, overflow: "hidden" }}>
            <Svg width={width} height={BAR_HEIGHT}>
              <Defs>
                <LinearGradient id="nav-sheen" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#ffffff" stopOpacity={0.7} />
                  <Stop offset="0.45" stopColor="#ffffff" stopOpacity={0.12} />
                  <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Rect width={width} height={BAR_HEIGHT} fill="url(#nav-sheen)" />
            </Svg>
          </View>
        )}

        {/* Floating indicator: green disc with a frosted glass ring and soft glow */}
        {width > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                top: -CIRCLE / 2 + 4,
                left: 0,
                width: CIRCLE,
                height: CIRCLE,
                borderRadius: CIRCLE / 2,
                borderWidth: 5,
                borderColor: "rgba(255,255,255,0.85)",
                backgroundColor: colors.brand,
                shadowColor: colors.brand,
                shadowOpacity: 0.5,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 6 },
                overflow: "hidden",
              },
              indicatorStyle,
            ]}
          >
            {/* glossy highlight on the disc */}
            <View
              style={{
                position: "absolute",
                top: -CIRCLE * 0.25,
                left: -CIRCLE * 0.1,
                width: CIRCLE * 0.9,
                height: CIRCLE * 0.55,
                borderRadius: CIRCLE,
                backgroundColor: "rgba(255,255,255,0.28)",
              }}
            />
          </Animated.View>
        )}

        <View style={{ flexDirection: "row" }}>
          {TABS.map((tab, index) => (
            <TabButton
              key={tab.id}
              tab={tab}
              index={index}
              position={position}
              badge={badges[tab.id] || { count: 0 }}
              onPress={() => select(tab.id)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
