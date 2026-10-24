import React, { useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Check, Flame, Heart, Minus, Plus, ShoppingBag, Sparkles, Star, Trash2, TrendingUp } from "lucide-react-native";
import { addToCart, removeFromCart, toggleWishlist, updateCartQty } from "@/store/slices/shopSlice";
import { formatTaka, getFinalPrice } from "@/lib/format";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const isWeb = Platform.OS === "web";

// Pastel backdrops behind the product shot, rotated per card
const TINTS = ["#e8f7f1", "#eaf1ff", "#f4ecff", "#fff4e0", "#ffecf3", "#e6f7fb"];

const REMARK_TAGS = {
  new: { label: "NEW", icon: Sparkles, color: "#2563eb" },
  trending: { label: "TRENDING", icon: TrendingUp, color: "#7c3aed" },
  popular: { label: "POPULAR", icon: Flame, color: "#ea580c" },
  top: { label: "TOP PICK", icon: Star, color: "#d97706" },
  best: { label: "BEST SELLER", icon: Flame, color: "#dc2626" },
};

const tapHaptic = () => {
  if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

export default function ProductCard({ product, index = 0, onOpenDetail }) {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.shop?.wishlist || []);
  const isWishlisted = wishlist.some((item) => item._id === product._id);
  const cartQty = useSelector((s) => (s.shop?.cart || []).find((i) => i._id === product._id)?.qty || 0);
  const inCart = cartQty > 0;
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef(null);

  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.get() }] }));

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const price = getFinalPrice(product);
  const savings = product.price > price ? product.price - price : 0;
  const stock = typeof product.stock === "number" ? product.stock : null;
  const outOfStock = stock === 0;
  const lowStock = stock !== null && stock > 0 && stock <= 5;
  const brandName = typeof product.brand === "object" ? product.brand?.brandName : null;
  const remark = REMARK_TAGS[product.remark];
  const tint = TINTS[index % TINTS.length];
  const rating = Number(product.star) || 4.8;

  const enteringAnim = isWeb ? undefined : FadeInDown.delay(Math.min(index, 8) * 60).springify();

  const handleToggleWishlist = (e) => {
    e?.stopPropagation?.();
    tapHaptic();
    heartScale.set(withSequence(withTiming(1.35, { duration: 120 }), withSpring(1, { damping: 6 })));
    dispatch(toggleWishlist(product));
  };

  const handleAddToCart = (e) => {
    e?.stopPropagation?.();
    if (outOfStock) return;
    tapHaptic();
    dispatch(addToCart({ product, qty: 1 }));
    setJustAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), 1400);
  };

  const maxQty = stock || 99;

  const handleIncrease = (e) => {
    e?.stopPropagation?.();
    if (cartQty >= maxQty) return;
    tapHaptic();
    dispatch(updateCartQty({ id: product._id, qty: cartQty + 1 }));
  };

  // At 1 the minus becomes a remove button
  const handleDecrease = (e) => {
    e?.stopPropagation?.();
    tapHaptic();
    if (cartQty <= 1) dispatch(removeFromCart(product._id));
    else dispatch(updateCartQty({ id: product._id, qty: cartQty - 1 }));
  };

  return (
    <Animated.View entering={enteringAnim} style={[tw("flex-1 p-1.5"), { maxWidth: isWeb ? "50%" : undefined }]}>
      <Pressable
        onPress={() => onOpenDetail?.(product)}
        style={({ pressed }) => [
          {
            flex: 1,
            backgroundColor: colors.glass,
          borderColor: colors.glassBorder,
            borderRadius: 22,
            padding: 8,
            borderWidth: 1,
            shadowColor: "#0f172a",
            shadowOpacity: 0.07,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 5 },
          },
          tw("cursor-pointer"),
          pressed && { transform: [{ scale: 0.975 }] },
        ]}
      >
        {/* Product image on a pastel stage */}
        <View
          style={{
            width: "100%",
            aspectRatio: 1,
            borderRadius: 16,
            backgroundColor: tint,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: "78%",
              aspectRatio: 1,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.65)",
            }}
          />
          <Image
            source={product.image?.url}
            style={{ width: "80%", height: "80%", opacity: outOfStock ? 0.45 : 1 }}
            contentFit="contain"
            transition={250}
          />

          {/* Top-left: discount takes priority over the remark tag */}
          <View style={tw("absolute top-2 left-2 gap-1")}>
            {product.discount > 0 && (
              <View style={[tw("px-2 py-0.5 rounded-full"), { backgroundColor: colors.red500 }]}>
                <Text style={[tw("text-white font-black"), { fontSize: 11 }]}>-{product.discount}%</Text>
              </View>
            )}
            {remark && (
              <View style={[tw("flex-row items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white self-start")]}>
                <remark.icon size={9} color={remark.color} strokeWidth={2.6} />
                <Text style={[tw("font-black"), { fontSize: 9, color: remark.color, letterSpacing: 0.3 }]}>{remark.label}</Text>
              </View>
            )}
          </View>

          {/* Wishlist with a pop animation */}
          <Pressable
            onPress={handleToggleWishlist}
            hitSlop={6}
            style={[
              tw("absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center cursor-pointer"),
              { backgroundColor: isWishlisted ? "#fee2e2" : "rgba(255,255,255,0.92)" },
            ]}
          >
            <Animated.View style={heartStyle}>
              <Heart
                size={15}
                color={isWishlisted ? colors.red500 : colors.gray500}
                fill={isWishlisted ? colors.red500 : "transparent"}
                strokeWidth={2.3}
              />
            </Animated.View>
          </Pressable>

          {/* Stock status chip */}
          {(outOfStock || lowStock) && (
            <View
              style={[
                tw("absolute bottom-2 left-2 px-2 py-0.5 rounded-full"),
                { backgroundColor: outOfStock ? "rgba(28,32,36,0.85)" : "#fef3c7" },
              ]}
            >
              <Text style={[tw("font-bold"), { fontSize: 10, color: outOfStock ? "#fff" : "#b45309" }]}>
                {outOfStock ? "Out of stock" : `Only ${stock} left`}
              </Text>
            </View>
          )}

          {/* In-cart ribbon */}
          {inCart && (
            <View
              style={[
                tw("absolute bottom-2 right-2 flex-row items-center gap-1 px-2 py-0.5 rounded-full"),
                { backgroundColor: colors.brand },
              ]}
            >
              <Check size={10} color="#fff" strokeWidth={3.2} />
              <Text style={[tw("text-white font-black"), { fontSize: 10 }]}>In cart · {cartQty}</Text>
            </View>
          )}
        </View>

        <View style={tw("px-1 pt-2.5 flex-1")}>
          {/* Brand + rating */}
          <View style={tw("flex-row items-center justify-between")}>
            <Text numberOfLines={1} style={[tw("font-extrabold text-brand-dark flex-1 pr-1"), { fontSize: 10, letterSpacing: 0.6 }]}>
              {(brandName || "Official").toUpperCase()}
            </Text>
            <View style={tw("flex-row items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-full")}>
              <Star size={10} color={colors.amber500} fill={colors.amber500} />
              <Text style={[tw("font-bold text-amber-800"), { fontSize: 10 }]}>{rating.toFixed(1)}</Text>
            </View>
          </View>

          {/* Title */}
          <Text numberOfLines={2} style={[tw("mt-1 text-xs font-bold text-gray-900"), { lineHeight: 17, minHeight: 34 }]}>
            {product.title}
          </Text>

          {/* Price + cart action */}
          <View style={tw("flex-row items-end justify-between mt-2")}>
            <View style={tw("flex-1 pr-1")}>
              {savings > 0 && (
                <Text numberOfLines={1} style={[tw("text-gray-400 font-medium"), { fontSize: 11, textDecorationLine: "line-through" }]}>
                  {formatTaka(product.price)}
                </Text>
              )}
              <Text numberOfLines={1} adjustsFontSizeToFit style={[tw("font-black text-gray-900"), { fontSize: 16 }]}>
                {formatTaka(price)}
              </Text>
            </View>

            {!inCart && (
              <Pressable
                onPress={handleAddToCart}
                disabled={outOfStock}
                hitSlop={4}
                style={({ pressed }) => [
                  {
                    width: 38,
                    height: 38,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: outOfStock ? colors.gray200 : justAdded ? colors.brandDark : colors.brand,
                    shadowColor: colors.brand,
                    shadowOpacity: outOfStock ? 0 : 0.35,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: outOfStock ? 0 : 3,
                  },
                  tw("cursor-pointer"),
                  pressed && { transform: [{ scale: 0.88 }] },
                ]}
              >
                {justAdded ? (
                  <Check size={17} color="#fff" strokeWidth={3} />
                ) : (
                  <ShoppingBag size={16} color={outOfStock ? colors.gray400 : "#fff"} strokeWidth={2.4} />
                )}
              </Pressable>
            )}
          </View>

          {/* Quantity stepper replaces the add button once the item is in the cart */}
          {inCart && (
            <View
              style={[
                tw("flex-row items-center justify-between mt-2 rounded-xl"),
                { height: 36, padding: 3, backgroundColor: colors.brandLight, borderWidth: 1, borderColor: "#bfe8d6" },
              ]}
            >
              <Pressable
                onPress={handleDecrease}
                hitSlop={4}
                style={({ pressed }) => [
                  tw("items-center justify-center bg-white rounded-lg cursor-pointer"),
                  { width: 30, height: 28 },
                  pressed && { transform: [{ scale: 0.88 }] },
                ]}
              >
                {cartQty <= 1 ? (
                  <Trash2 size={13} color={colors.red500} strokeWidth={2.4} />
                ) : (
                  <Minus size={14} color={colors.brandDark} strokeWidth={2.8} />
                )}
              </Pressable>

              <Text style={tw("text-xs font-black text-brand-dark")}>
                {cartQty} in cart
              </Text>

              <Pressable
                onPress={handleIncrease}
                disabled={cartQty >= maxQty}
                hitSlop={4}
                style={({ pressed }) => [
                  tw("items-center justify-center rounded-lg cursor-pointer"),
                  { width: 30, height: 28, backgroundColor: cartQty >= maxQty ? colors.gray200 : colors.brand },
                  pressed && { transform: [{ scale: 0.88 }] },
                ]}
              >
                <Plus size={14} color="#fff" strokeWidth={2.8} />
              </Pressable>
            </View>
          )}

          {savings > 0 && (
            <View style={[tw("self-start mt-1.5 px-1.5 py-0.5 rounded-md"), { backgroundColor: colors.brandLight }]}>
              <Text style={[tw("font-bold text-brand-dark"), { fontSize: 10 }]}>Save {formatTaka(savings)}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
