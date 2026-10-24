import React, { useEffect, useState } from "react";
import { Animated, Platform, View } from "react-native";
import tw from "@/lib/tw";

const isWeb = Platform.OS === "web";

export function ProductSkeletonItem() {
  const [opacityAnim] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <View style={[tw("flex-1 p-1.5"), { maxWidth: isWeb ? "50%" : undefined }]}>
      <Animated.View
        style={[
          tw("flex-1 bg-surface rounded-2xl p-3 border border-gray-100 shadow-xs relative overflow-hidden"),
          { opacity: opacityAnim },
        ]}
      >
        {/* Image Box Placeholder */}
        <View style={tw("w-full h-36 rounded-xl bg-gray-200/70 items-center justify-center relative overflow-hidden")}>
          <View style={tw("w-10 h-10 rounded-full bg-gray-300/60")} />
        </View>

        {/* Rating / Badge bar */}
        <View style={tw("flex-row items-center gap-2 mt-3")}>
          <View style={tw("w-12 h-3 rounded-full bg-gray-200/80")} />
          <View style={tw("w-14 h-3 rounded-full bg-gray-200/60")} />
        </View>

        {/* Title Lines */}
        <View style={tw("w-full h-3.5 rounded-md bg-gray-200/80 mt-2.5")} />
        <View style={tw("w-3/5 h-3.5 rounded-md bg-gray-200/60 mt-1.5")} />

        {/* Price & Action Row */}
        <View style={tw("mt-3 flex-row items-center justify-between pt-2 border-t border-gray-50")}>
          <View style={tw("gap-1")}>
            <View style={tw("w-16 h-4 rounded-md bg-gray-200/80")} />
            <View style={tw("w-10 h-2.5 rounded-md bg-gray-200/50")} />
          </View>
          <View style={tw("w-8 h-8 rounded-full bg-gray-200/80")} />
        </View>
      </Animated.View>
    </View>
  );
}

export default function ProductGridSkeleton({ count = 6 }) {
  const items = Array.from({ length: count });
  return (
    <View style={tw("px-2.5 py-1")}>
      <View style={tw("flex-row flex-wrap justify-between")}>
        {items.map((_, index) => (
          <View key={index} style={tw("w-1/2")}>
            <ProductSkeletonItem />
          </View>
        ))}
      </View>
    </View>
  );
}
