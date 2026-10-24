import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { BadgeCheck, ShieldCheck } from "lucide-react-native";
import SectionHeader from "@/components/SectionHeader";
import useWebDragScroll from "@/hooks/useWebDragScroll";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const GAP = 10;
const VISIBLE_TILES = 3.4;

export default function BrandShowcase({ brands = [], isLoading, onSelectBrand }) {
  const [width, setWidth] = useState(0);
  const { gesture, scrollRef, onScroll, wasDragged, dragStyle } = useWebDragScroll();

  const tileWidth = width
    ? Math.round(Math.min(Math.max((width - 32 - GAP * 3) / VISIBLE_TILES, 96), 140))
    : 104;
  const logoHeight = Math.round(tileWidth * 0.36);

  if (!isLoading && brands.length === 0) return null;

  const handlePress = (brand) => {
    if (wasDragged()) return;
    onSelectBrand?.(brand);
  };

  return (
    <View style={tw("mt-5")} onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}>
      <SectionHeader
        title="Official Brand Stores"
        subtitle="Authorised stock with brand warranty"
        right={
          <View style={tw("flex-row items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200")}>
            <ShieldCheck size={12} color={colors.brand} />
            <Text style={tw("text-xs font-bold text-brand-dark")}>100% Genuine</Text>
          </View>
        }
      />

      <GestureDetector gesture={gesture}>
        <View style={dragStyle}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 16, gap: GAP, paddingVertical: 4 }}
          >
            {isLoading && brands.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <View key={i} style={[tw("bg-gray-100"), { width: tileWidth, height: logoHeight + 46, borderRadius: 18 }]} />
                ))
              : brands.map((brand, idx) => {
                  const bImg = typeof brand.brandImg === "string" ? brand.brandImg : brand.brandImg?.url;
                  const bName = brand.brandName || "Brand";

                  return (
                    <Pressable
                      key={brand._id || idx}
                      onPress={() => handlePress(brand)}
                      style={({ pressed }) => [
                        {
                          width: tileWidth,
                          borderRadius: 18,
                          backgroundColor: colors.glass,
          borderColor: colors.glassBorder,
                          borderWidth: 1,
                          paddingVertical: 12,
                          paddingHorizontal: 10,
                          alignItems: "center",
                          shadowColor: "#0f172a",
                          shadowOpacity: 0.06,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 3 },
                        },
                        tw("cursor-pointer"),
                        pressed && { transform: [{ scale: 0.95 }], borderColor: colors.brand },
                      ]}
                    >
                      <View style={{ width: "100%", height: logoHeight, alignItems: "center", justifyContent: "center" }}>
                        {bImg ? (
                          <Image
                            source={bImg}
                            style={{ width: "80%", height: "100%" }}
                            contentFit="contain"
                            transition={200}
                            pointerEvents="none"
                          />
                        ) : (
                          <Text style={tw("text-base font-black text-gray-900")}>{bName}</Text>
                        )}
                      </View>

                      <View style={[tw("w-full mt-2.5"), { height: 1, backgroundColor: colors.gray50 }]} />

                      <View style={tw("flex-row items-center gap-1 mt-2")}>
                        <Text numberOfLines={1} style={[tw("text-xs font-bold text-gray-800"), { flexShrink: 1 }]}>
                          {bName}
                        </Text>
                        <BadgeCheck size={13} color={colors.brand} strokeWidth={2.4} />
                      </View>
                    </Pressable>
                  );
                })}
          </ScrollView>
        </View>
      </GestureDetector>
    </View>
  );
}
