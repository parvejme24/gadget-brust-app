import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import {
  AlertTriangle,
  HeartOff,
  RefreshCw,
  SearchX,
  ServerOff,
  ShoppingBag,
  SlidersHorizontal,
  WifiOff,
} from "lucide-react-native";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const CONFIGS = {
  offline: {
    icon: WifiOff,
    iconColor: colors.amber500,
    iconBg: "bg-amber-100",
    badgeColor: "bg-amber-50 border-amber-200 text-amber-800",
    badgeText: "Offline Mode",
    title: "You are currently offline",
    desc: "No internet connection detected. Please check your Wi-Fi or cellular network. You can still browse previously cached gadgets.",
    actionText: "Try Reconnecting",
  },
  "server-error": {
    icon: ServerOff,
    iconColor: colors.red500,
    iconBg: "bg-red-100",
    badgeColor: "bg-red-50 border-red-200 text-red-800",
    badgeText: "Server Unavailable",
    title: "Unable to reach server",
    desc: "Our storefront server is currently taking longer than usual to respond. Showing offline catalog in the meantime.",
    actionText: "Reconnect Server",
  },
  "empty-search": {
    icon: SearchX,
    iconColor: colors.gray500,
    iconBg: "bg-gray-100",
    badgeColor: "bg-gray-50 border-gray-200 text-gray-700",
    badgeText: "No Search Results",
    title: "No gadgets found",
    desc: "We couldn't find any gadgets matching your query. Check spelling or try broader terms like 'MacBook', 'Sony', or 'Phone'.",
    actionText: "Clear Search",
  },
  "empty-filter": {
    icon: SlidersHorizontal,
    iconColor: colors.brand,
    iconBg: "bg-emerald-100",
    badgeColor: "bg-emerald-50 border-emerald-200 text-emerald-800",
    badgeText: "No Filter Matches",
    title: "No products match filters",
    desc: "There are no gadgets matching this specific combination of category and brand. Try clearing some filters.",
    actionText: "Reset All Filters",
  },
  "empty-wishlist": {
    icon: HeartOff,
    iconColor: colors.red500,
    iconBg: "bg-red-100",
    badgeColor: "bg-red-50 border-red-200 text-red-800",
    badgeText: "Wishlist Empty",
    title: "Your wishlist is empty",
    desc: "Save your favorite laptops, smartphones, and ANC audio gear here by tapping the heart icon on any product card.",
    actionText: "Explore Gadgets",
  },
  "empty-cart": {
    icon: ShoppingBag,
    iconColor: colors.brand,
    iconBg: "bg-emerald-100",
    badgeColor: "bg-emerald-50 border-emerald-200 text-emerald-800",
    badgeText: "Cart Empty",
    title: "Your shopping bag is empty",
    desc: "Add your favorite genuine gadgets to your cart. All orders include official warranty and express dispatch.",
    actionText: "Discover Gadgets",
  },
};

export default function ErrorState({
  type = "offline",
  title,
  desc,
  actionText,
  onAction,
  isLoading = false,
  style,
}) {
  const config = CONFIGS[type] || CONFIGS.offline;
  const IconComponent = config.icon || AlertTriangle;
  const finalTitle = title || config.title;
  const finalDesc = desc || config.desc;
  const finalActionText = actionText || config.actionText;

  return (
    <View style={[tw("items-center justify-center p-6 my-6 text-center"), style]}>
      {/* Icon Circle */}
      <View style={[tw("w-16 h-16 rounded-3xl items-center justify-center shadow-xs mb-3.5"), tw(config.iconBg)]}>
        <IconComponent size={28} color={config.iconColor} strokeWidth={2.2} />
      </View>

      {/* Badge Pill */}
      <View style={[tw("px-2.5 py-0.5 rounded-full border mb-2.5"), tw(config.badgeColor.split(" ")[0]), tw(config.badgeColor.split(" ")[1])]}>
        <Text style={tw("text-xs font-bold text-gray-700")}>
          {config.badgeText}
        </Text>
      </View>

      {/* Title & Description */}
      <Text style={tw("text-base font-extrabold text-gray-900 text-center")}>
        {finalTitle}
      </Text>
      <Text style={tw("text-xs text-gray-500 mt-1.5 max-w-xs text-center leading-5")}>
        {finalDesc}
      </Text>

      {/* Action Button */}
      {!!onAction && (
        <Pressable
          onPress={onAction}
          disabled={isLoading}
          style={({ pressed }) => [
            tw("mt-5 bg-brand px-5 py-2.5 rounded-full flex-row items-center gap-2 shadow-sm cursor-pointer"),
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            isLoading && { opacity: 0.7 },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <RefreshCw size={14} color="white" strokeWidth={2.5} />
          )}
          <Text style={tw("text-white text-xs font-extrabold")}>
            {isLoading ? "Checking..." : finalActionText}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
