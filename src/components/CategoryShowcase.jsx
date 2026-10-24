import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { Laptop } from "lucide-react-native";
import SectionHeader from "@/components/SectionHeader";
import useWebDragScroll from "@/hooks/useWebDragScroll";
import tw from "@/lib/tw";

// Soft pastel tile + matching ring colour per category
const TINTS = [
  { bg: "#e8f7f1", ring: "#bfe8d6", text: "#2d8f6a" },
  { bg: "#eaf1ff", ring: "#c7d9ff", text: "#1d4ed8" },
  { bg: "#f4ecff", ring: "#dccbff", text: "#6d28d9" },
  { bg: "#fff4e0", ring: "#fde2a8", text: "#b45309" },
  { bg: "#ffecf3", ring: "#fbc7dc", text: "#be185d" },
  { bg: "#e6f7fb", ring: "#b9e6f2", text: "#0e7490" },
];

const GAP = 10;
const VISIBLE_TILES = 4.4; // a partial tile hints that the row scrolls

export default function CategoryShowcase({ categories = [], isLoading, onSelectCategory, onSeeAll }) {
  const [width, setWidth] = useState(0);
  const { gesture, scrollRef, onScroll, wasDragged, dragStyle } = useWebDragScroll();

  const tileWidth = width
    ? Math.round(Math.min(Math.max((width - 32 - GAP * 4) / VISIBLE_TILES, 72), 104))
    : 80;
  const iconBox = Math.round(tileWidth * 0.78);

  const handlePress = (cat) => {
    if (wasDragged()) return;
    onSelectCategory?.(cat);
  };

  return (
    <View style={tw("mt-4")} onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}>
      <SectionHeader title="Shop by Category" subtitle="Find the right gadget faster" onAction={onSeeAll} />

      <GestureDetector gesture={gesture}>
        <View style={dragStyle}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 16, gap: GAP, paddingBottom: 4 }}
          >
            {isLoading && categories.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <View key={i} style={{ width: tileWidth, alignItems: "center" }}>
                    <View style={[tw("bg-gray-100"), { width: iconBox, height: iconBox, borderRadius: 22 }]} />
                    <View style={[tw("bg-gray-100 rounded-full mt-2"), { width: tileWidth * 0.6, height: 10 }]} />
                  </View>
                ))
              : categories.map((cat, idx) => {
                  const tint = TINTS[idx % TINTS.length];
                  const image = cat.categoryImg?.url;
                  const title = cat.categoryName || cat.label || "Category";
                  const FallbackIcon = cat.icon || Laptop;
                  const subCount = cat.subcategories?.length || 0;

                  return (
                    <Pressable
                      key={cat._id || cat.id || idx}
                      onPress={() => handlePress(cat)}
                      style={({ pressed }) => [
                        { width: tileWidth, alignItems: "center" },
                        tw("cursor-pointer"),
                        pressed && { transform: [{ scale: 0.93 }] },
                      ]}
                    >
                      <View
                        style={{
                          width: iconBox,
                          height: iconBox,
                          borderRadius: 22,
                          backgroundColor: tint.bg,
                          borderWidth: 1.5,
                          borderColor: tint.ring,
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {/* Highlight bubble for depth */}
                        <View
                          pointerEvents="none"
                          style={{
                            position: "absolute",
                            top: -iconBox * 0.25,
                            right: -iconBox * 0.25,
                            width: iconBox * 0.7,
                            height: iconBox * 0.7,
                            borderRadius: iconBox,
                            backgroundColor: "rgba(255,255,255,0.45)",
                          }}
                        />
                        {image ? (
                          <Image
                            source={image}
                            style={{ width: "68%", height: "68%" }}
                            contentFit="contain"
                            transition={200}
                            pointerEvents="none"
                          />
                        ) : (
                          <FallbackIcon size={iconBox * 0.4} color={tint.text} strokeWidth={2} />
                        )}
                      </View>
                      <Text numberOfLines={1} style={tw("text-xs font-bold text-gray-900 text-center mt-1.5")}>
                        {title}
                      </Text>
                      {subCount > 0 && (
                        <Text numberOfLines={1} style={[tw("text-center font-medium"), { fontSize: 10, color: tint.text }]}>
                          {subCount} types
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
          </ScrollView>
        </View>
      </GestureDetector>
    </View>
  );
}
