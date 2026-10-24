import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import { ShoppingBag, Trash2 } from "lucide-react-native";
import ErrorState from "./ErrorState";
import { addToCart, toggleWishlist } from "@/store/slices/shopSlice";
import { formatTaka, getFinalPrice } from "@/lib/format";
import tw from "@/lib/tw";
import { colors } from "@/theme";

export default function WishlistView({ onExplore, onOpenDetail }) {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.shop?.wishlist || []);

  const handleMoveToCart = (product) => {
    dispatch(addToCart({ product, qty: 1 }));
    dispatch(toggleWishlist(product));
  };

  const handleRemove = (product) => {
    dispatch(toggleWishlist(product));
  };

  if (wishlist.length === 0) {
    return (
      <View style={tw("flex-1 items-center justify-center p-6 bg-canvas")}>
        <ErrorState
          type="empty-wishlist"
          onAction={onExplore}
        />
      </View>
    );
  }

  return (
    <View style={tw("flex-1 bg-canvas")}>
      {/* Header */}
      <View style={tw("p-4 bg-surface border-b border-gray-100 flex-row items-center justify-between")}>
        <View>
          <Text style={tw("text-lg font-extrabold text-gray-900")}>My Wishlist</Text>
          <Text style={tw("text-xs text-gray-500")}>
            {wishlist.length} {wishlist.length === 1 ? "saved item" : "saved items"}
          </Text>
        </View>
      </View>

      <FlatList
        data={wishlist}
        keyExtractor={(item) => item._id}
        contentContainerStyle={tw("p-4 pb-20 gap-3")}
        renderItem={({ item }) => {
          const price = getFinalPrice(item);
          return (
            <Pressable
              onPress={() => onOpenDetail?.(item)}
              style={({ pressed }) => [
                tw("flex-row bg-surface p-3 rounded-2xl border border-gray-100 shadow-sm items-center gap-3 cursor-pointer"),
                pressed && { opacity: 0.95 },
              ]}
            >
              {/* Image */}
              <View style={tw("w-20 h-20 rounded-xl bg-gray-50 overflow-hidden items-center justify-center relative")}>
                <Image
                  source={item.image?.url}
                  style={tw("w-full h-full p-2")}
                  contentFit="contain"
                />
                {item.discount > 0 && (
                  <View style={tw("absolute top-1 left-1 bg-red-500 px-1.5 py-0.5 rounded-full")}>
                    <Text style={tw("text-white text-xs font-bold")}>-{item.discount}%</Text>
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={tw("flex-1 justify-between")}>
                <Text numberOfLines={2} style={tw("text-xs font-semibold text-gray-900")}>
                  {item.title}
                </Text>
                <View style={tw("flex-row items-baseline gap-2 mt-1")}>
                  <Text style={tw("text-sm font-extrabold text-gray-900")}>
                    {formatTaka(price)}
                  </Text>
                  {price < item.price && (
                    <Text style={[tw("text-xs text-gray-400"), { textDecorationLine: "line-through" }]}>
                      {formatTaka(item.price)}
                    </Text>
                  )}
                </View>

                {/* Move to Cart button */}
                <Pressable
                  onPress={() => handleMoveToCart(item)}
                  style={({ pressed }) => [
                    tw("mt-2 flex-row items-center gap-1.5 bg-brand px-3 py-1.5 rounded-full self-start cursor-pointer"),
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <ShoppingBag size={12} color="white" />
                  <Text style={tw("text-white text-xs font-bold")}>Move to Cart</Text>
                </Pressable>
              </View>

              {/* Remove button */}
              <Pressable
                onPress={() => handleRemove(item)}
                style={({ pressed }) => [
                  tw("p-2 rounded-full bg-gray-50 items-center justify-center cursor-pointer"),
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Trash2 size={16} color={colors.gray400} />
              </Pressable>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
