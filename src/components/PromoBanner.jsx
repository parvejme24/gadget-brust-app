import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { ArrowRight, Sparkles } from "lucide-react-native";
import { useSliderProducts } from "@/hooks/useStorefront";
import { formatTaka, getFinalPrice } from "@/lib/format";
import tw from "@/lib/tw";

const ACCENTS = ["#10b981", "#2563eb", "#7c3aed", "#f59e0b"];

export default function PromoBanner({ onSelectProduct }) {
  const { data: sliderProducts = [], isLoading } = useSliderProducts();
  const [activeIdx, setActiveIdx] = useState(0);

  // Generate dynamic banners directly from live API slider products
  const banners = useMemo(() => {
    if (sliderProducts && Array.isArray(sliderProducts) && sliderProducts.length > 0) {
      return sliderProducts.slice(0, 5).map((p, idx) => ({
        id: p._id,
        tag: p.discount > 0 ? `${p.discount}% DISCOUNT` : "SPECIAL OFFER",
        title: p.title,
        subtitle: `Official warranty • Special price ${formatTaka(getFinalPrice(p))}`,
        badge: "Official Stock",
        accent: ACCENTS[idx % ACCENTS.length],
        image: p.image?.url,
        rawProduct: p,
      }));
    }
    return [];
  }, [sliderProducts]);

  if (banners.length === 0) {
    if (isLoading) {
      return (
        <View style={tw("my-2 px-4")}>
          <View style={[tw("rounded-2xl p-5 bg-gray-100"), { height: 140 }]} />
        </View>
      );
    }
    return null;
  }

  return (
    <View style={tw("my-2")}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw("px-4")}
        onMomentumScrollEnd={(e) => {
          const offset = e.nativeEvent.contentOffset.x;
          const width = e.nativeEvent.layoutMeasurement.width;
          if (width > 0) setActiveIdx(Math.round(offset / width));
        }}
      >
        {banners.map((banner) => (
          <View key={banner.id} style={[tw("mr-4"), { width: 320 }]}>
            <View
              style={[
                tw("p-5 rounded-2xl justify-between shadow-md relative overflow-hidden"),
                { backgroundColor: banner.accent, minHeight: 140 },
              ]}
            >
              {/* Product Background Image if available */}
              {banner.image && (
                <View style={tw("absolute right-2 bottom-2 w-28 h-28 opacity-25 items-center justify-center")}>
                  <Image
                    source={banner.image}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="contain"
                  />
                </View>
              )}

              <View style={tw("flex-row justify-between items-center")}>
                <View style={tw("flex-row items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full")}>
                  <Sparkles size={12} color="white" />
                  <Text style={tw("text-white text-xs font-bold")}>{banner.tag}</Text>
                </View>
                <View style={tw("bg-black/20 px-2.5 py-0.5 rounded-full")}>
                  <Text style={tw("text-white text-xs font-bold")}>{banner.badge}</Text>
                </View>
              </View>

              <View style={tw("my-2 pr-12")}>
                <Text numberOfLines={1} style={tw("text-lg font-extrabold text-white")}>
                  {banner.title}
                </Text>
                <Text numberOfLines={1} style={tw("text-xs text-white/90 mt-0.5 font-medium")}>
                  {banner.subtitle}
                </Text>
              </View>

              <Pressable
                onPress={() => banner.rawProduct && onSelectProduct?.(banner.rawProduct)}
                style={({ pressed }) => [
                  tw("self-start flex-row items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full shadow-sm cursor-pointer"),
                  pressed && { transform: [{ scale: 0.94 }] },
                ]}
              >
                <Text style={tw("text-xs font-bold text-gray-900")}>Shop Now</Text>
                <ArrowRight size={13} color={banner.accent} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dots Indicator */}
      <View style={tw("flex-row items-center justify-center gap-1 mt-2.5")}>
        {banners.map((_, idx) => (
          <View
            key={idx}
            style={[
              tw("h-1.5 rounded-full"),
              activeIdx === idx ? tw("w-5 bg-brand") : tw("w-1.5 bg-gray-200"),
            ]}
          />
        ))}
      </View>
    </View>
  );
}
