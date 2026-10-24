import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import HeroBackground from "@/components/HeroBackground";
import tw from "@/lib/tw";

// Green hero header for screens: optional back button, title, subtitle and an optional glass action button
export default function ScreenHeader({ id, title, subtitle, actionLabel, actionIcon: ActionIcon, onAction, onBack, children }) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  return (
    <View
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      style={{ borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden", paddingHorizontal: 18, paddingTop: 14, paddingBottom: 20 }}
    >
      <HeroBackground id={id} width={size.width} height={size.height} />
      <View style={tw("flex-row items-center justify-between")}>
        {onBack && (
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              tw("w-10 h-10 rounded-xl items-center justify-center mr-3 cursor-pointer"),
              { backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)" },
              pressed && { opacity: 0.7 },
            ]}
          >
            <ArrowLeft size={19} color="#fff" />
          </Pressable>
        )}
        <View style={tw("flex-1 pr-3")}>
          <Text style={[tw("text-white font-black"), { fontSize: 22 }]}>{title}</Text>
          {!!subtitle && (
            <Text style={[tw("text-xs font-medium mt-0.5"), { color: "rgba(255,255,255,0.8)" }]}>{subtitle}</Text>
          )}
        </View>
        {onAction && (
          <Pressable
            onPress={onAction}
            style={({ pressed }) => [
              tw("flex-row items-center gap-1.5 px-3 py-2 rounded-full cursor-pointer"),
              { backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
              pressed && { opacity: 0.7 },
            ]}
          >
            {ActionIcon && <ActionIcon size={13} color="#fff" strokeWidth={2.4} />}
            <Text style={tw("text-white text-xs font-bold")}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}
