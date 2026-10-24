import React from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import tw from "@/lib/tw";
import { colors } from "@/theme";

export default function SectionHeader({ title, subtitle, actionText = "See All", onAction, right }) {
  return (
    <View style={tw("flex-row justify-between items-end px-4 mb-3")}>
      <View style={tw("flex-1 pr-3")}>
        <Text style={tw("text-base font-extrabold text-gray-900")}>{title}</Text>
        {!!subtitle && <Text style={tw("text-xs text-gray-500 font-medium mt-0.5")}>{subtitle}</Text>}
      </View>
      {right}
      {onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            tw("flex-row items-center gap-0.5 bg-emerald-50 px-3 py-1.5 rounded-full cursor-pointer"),
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={tw("text-xs font-bold text-brand-dark")}>{actionText}</Text>
          <ChevronRight size={14} color={colors.brandDark} strokeWidth={2.5} />
        </Pressable>
      )}
    </View>
  );
}
