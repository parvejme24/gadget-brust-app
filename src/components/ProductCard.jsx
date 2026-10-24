import React from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Heart, ShoppingBag, Star } from "lucide-react-native";
import { addToCart, toggleWishlist } from "@/store/slices/shopSlice";
import { formatTaka, getFinalPrice } from "@/lib/format";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const isWeb = Platform.OS === "web";

export default function ProductCard({ product, index = 0, onOpenDetail }) {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.shop?.wishlist || []);
  const isWishlisted = wishlist.some((item) => item._id === product._id);

  const price = getFinalPrice(product);
  const enteringAnim = isWeb ? undefined : FadeInDown.delay(Math.min(index, 8) * 60).springify();

  const handleToggleWishlist = (e) => {
    e?.stopPropagation?.();
    dispatch(toggleWishlist(product));
  };

  const handleAddToCart = (e) => {
    e?.stopPropagation?.();
    dispatch(addToCart({ product, qty: 1 }));
  };

  return (
    <Animated.View
      entering={enteringAnim}
      style={[tw("flex-1 p-1.5"), { maxWidth: isWeb ? "50%" : undefined }]}
    >
      <Pressable
        onPress={() => onOpenDetail?.(product)}
        style={({ pressed }) => [
          tw("flex-1 bg-surface rounded-2xl p-3 border border-gray-100 shadow-sm relative overflow-hidden cursor-pointer"),
          pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
        ]}
      >
        {/* Product Image Box */}
        <View style={tw("w-full h-36 rounded-xl bg-gray-50 overflow-hidden relative items-center justify-center")}>
          <Image
            source={product.image?.url}
            style={{ width: "88%", height: "88%" }}
            contentFit="contain"
            transition={200}
          />

          {/* Discount Badge */}
          {product.discount > 0 && (
            <View style={tw("absolute top-2.5 left-2.5 bg-red-500 px-2 py-0.5 rounded-full z-10 shadow-sm")}>
              <Text style={tw("text-white text-xs font-extrabold")}>-{product.discount}%</Text>
            </View>
          )}

          {/* Wishlist Floating Button */}
          <Pressable
            onPress={handleToggleWishlist}
            style={({ pressed }) => [
              tw(
                "absolute top-2.5 right-2.5 w-8 h-8 rounded-full items-center justify-center z-10 cursor-pointer shadow-sm border",
                isWishlisted ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
              ),
              pressed && { transform: [{ scale: 0.85 }] },
            ]}
          >
            <Heart
              size={15}
              color={isWishlisted ? colors.red500 : colors.gray400}
              fill={isWishlisted ? colors.red500 : "transparent"}
            />
          </Pressable>
        </View>

        {/* Rating & Brand tag */}
        <View style={tw("flex-row items-center gap-1 mt-2.5")}>
          <Star size={12} color={colors.amber500} fill={colors.amber500} />
          <Text style={tw("text-xs text-gray-500 font-bold")}>{product.star || 4.8}</Text>
          <Text style={tw("text-xs text-gray-400")}>• Official</Text>
        </View>

        {/* Title */}
        <Text numberOfLines={2} style={[tw("mt-1 text-xs font-semibold text-gray-900 leading-4"), { minHeight: 32 }]}>
          {product.title}
        </Text>

        {/* Price and Cart Action */}
        <View style={tw("mt-2 flex-row items-center justify-between pt-1.5 border-t border-gray-50")}>
          <View>
            <Text style={tw("text-sm font-extrabold text-gray-900")}>
              {formatTaka(price)}
            </Text>
            {price < product.price && (
              <Text style={[tw("text-xs text-gray-400 font-medium"), { textDecorationLine: "line-through" }]}>
                {formatTaka(product.price)}
              </Text>
            )}
          </View>

          {/* Cart Icon Button */}
          <Pressable
            onPress={handleAddToCart}
            style={({ pressed }) => [
              tw("w-9 h-9 rounded-full bg-brand items-center justify-center shadow-sm cursor-pointer"),
              pressed && { transform: [{ scale: 0.88 }] },
            ]}
          >
            <ShoppingBag size={15} color="white" strokeWidth={2.5} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}
