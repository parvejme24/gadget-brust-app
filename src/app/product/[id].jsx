import React, { useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Zap,
} from "lucide-react-native";
import { addToCart, toggleWishlist } from "@/store/slices/shopSlice";
import { useProductById } from "@/hooks/useStorefront";
import ErrorState from "@/components/ErrorState";
import { formatTaka, getFinalPrice } from "@/lib/format";
import tw from "@/lib/tw";
import { colors } from "@/theme";

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();

  const { data: product, isLoading, isError, refetch } = useProductById(id);

  const wishlist = useSelector((s) => s.shop?.wishlist || []);
  const isWishlisted = product ? wishlist.some((item) => item._id === product._id) : false;

  const [qty, setQty] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  const price = product ? getFinalPrice(product) : 0;
  const savings = product ? Math.max(0, (product.price || price) - price) : 0;

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ product, qty }));
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    dispatch(addToCart({ product, qty }));
    router.replace("/");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={tw("flex-1 bg-canvas items-center justify-center")}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={tw("text-xs font-semibold text-gray-500 mt-3")}>Loading gadget specs...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !product) {
    return (
      <SafeAreaView style={tw("flex-1 bg-canvas p-6 justify-center")}>
        <ErrorState
          type="server-error"
          title="Product Not Found"
          message="Could not load the requested product from the store catalog."
          onAction={refetch}
        />
        <Pressable
          onPress={() => router.back()}
          style={tw("mt-4 self-center bg-gray-100 px-5 py-2.5 rounded-xl")}
        >
          <Text style={tw("text-xs font-bold text-gray-700")}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw("flex-1 bg-canvas")}>
      {/* Top Bar */}
      <View style={tw("p-4 bg-surface flex-row items-center justify-between border-b border-gray-100 shadow-sm")}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            tw("w-10 h-10 rounded-full bg-gray-50 border border-gray-200 items-center justify-center cursor-pointer"),
            pressed && { opacity: 0.7 },
          ]}
        >
          <ArrowLeft size={20} color={colors.gray800} />
        </Pressable>

        <Text style={tw("text-xs font-bold text-gray-500 uppercase tracking-wider")}>
          Product Details
        </Text>

        <Pressable
          onPress={() => dispatch(toggleWishlist(product))}
          style={({ pressed }) => [
            tw(
              "w-10 h-10 rounded-full items-center justify-center border cursor-pointer",
              isWishlisted ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
            ),
            pressed && { transform: [{ scale: 0.88 }] },
          ]}
        >
          <Heart
            size={18}
            color={isWishlisted ? colors.red500 : colors.gray500}
            fill={isWishlisted ? colors.red500 : "transparent"}
          />
        </Pressable>
      </View>

      {/* Toast Alert */}
      {addedToast && (
        <View style={tw("bg-emerald-600 p-2.5 mx-4 mt-2 rounded-xl flex-row items-center justify-center gap-2 shadow-md")}>
          <CheckCircle2 size={16} color="white" />
          <Text style={tw("text-white text-xs font-bold")}>
            Added {qty} {qty > 1 ? "items" : "item"} to your cart!
          </Text>
        </View>
      )}

      {/* Scrollable details */}
      <ScrollView contentContainerStyle={tw("p-4 pb-36 gap-4")} showsVerticalScrollIndicator={false}>
        {/* Showcase Image */}
        <View style={tw("w-full h-64 rounded-3xl bg-surface border border-gray-100 items-center justify-center p-6 shadow-sm relative")}>
          <Image
            source={product.image?.url}
            style={{ width: "90%", height: "90%" }}
            contentFit="contain"
            transition={200}
          />
          {product.discount > 0 && (
            <View style={tw("absolute top-4 left-4 bg-red-500 px-3 py-1 rounded-full shadow-sm")}>
              <Text style={tw("text-white text-xs font-extrabold")}>-{product.discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Title & Price Bar */}
        <View style={tw("bg-surface p-4 rounded-2xl border border-gray-100 shadow-sm gap-2")}>
          <View style={tw("flex-row items-center justify-between")}>
            <View style={tw("bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200")}>
              <Text style={tw("text-xs font-bold text-brand-dark")}>Official Warranty</Text>
            </View>
            <View style={tw("flex-row items-center gap-1")}>
              <Star size={14} color={colors.amber500} fill={colors.amber500} />
              <Text style={tw("text-xs font-bold text-gray-900")}>{product.star || 4.9}</Text>
              <Text style={tw("text-xs text-gray-400")}>(148 reviews)</Text>
            </View>
          </View>

          <Text style={tw("text-lg font-extrabold text-gray-900 leading-6")}>
            {product.title}
          </Text>

          <View style={tw("flex-row items-baseline gap-3 mt-1")}>
            <Text style={tw("text-2xl font-extrabold text-brand")}>
              {formatTaka(price)}
            </Text>
            {savings > 0 && (
              <Text style={[tw("text-sm text-gray-400 font-medium"), { textDecorationLine: "line-through" }]}>
                {formatTaka(product.price)}
              </Text>
            )}
            {savings > 0 && (
              <View style={tw("bg-red-50 px-2 py-0.5 rounded-full")}>
                <Text style={tw("text-xs font-bold text-red-600")}>
                  Save {formatTaka(savings)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Specs & Features */}
        <View style={tw("bg-surface p-4 rounded-2xl border border-gray-100 shadow-sm gap-3")}>
          <Text style={tw("text-sm font-bold text-gray-900")}>Key Specifications</Text>
          <View style={tw("gap-2")}>
            <View style={tw("flex-row justify-between py-1.5 border-b border-gray-50")}>
              <Text style={tw("text-xs text-gray-500 font-medium")}>Condition</Text>
              <Text style={tw("text-xs text-gray-900 font-bold")}>100% Brand New, Factory Sealed</Text>
            </View>
            <View style={tw("flex-row justify-between py-1.5 border-b border-gray-50")}>
              <Text style={tw("text-xs text-gray-500 font-medium")}>Warranty</Text>
              <Text style={tw("text-xs text-brand font-bold")}>1 Year Official Brand Warranty</Text>
            </View>
            <View style={tw("flex-row justify-between py-1.5 border-b border-gray-50")}>
              <Text style={tw("text-xs text-gray-500 font-medium")}>Delivery</Text>
              <Text style={tw("text-xs text-gray-900 font-bold")}>Next-Day Express Dispatch</Text>
            </View>
          </View>
        </View>

        {/* Perks */}
        <View style={tw("bg-surface p-4 rounded-2xl border border-gray-100 shadow-sm gap-3")}>
          <View style={tw("flex-row items-center gap-3")}>
            <View style={tw("w-10 h-10 rounded-full bg-emerald-50 items-center justify-center")}>
              <ShieldCheck size={20} color={colors.brand} />
            </View>
            <View style={tw("flex-1")}>
              <Text style={tw("text-xs font-bold text-gray-900")}>100% Genuine Device</Text>
              <Text style={tw("text-xs text-gray-500")}>Official Bangladesh warranty card included</Text>
            </View>
          </View>

          <View style={tw("flex-row items-center gap-3")}>
            <View style={tw("w-10 h-10 rounded-full bg-blue-50 items-center justify-center")}>
              <Truck size={20} color="#2563eb" />
            </View>
            <View style={tw("flex-1")}>
              <Text style={tw("text-xs font-bold text-gray-900")}>Express Delivery</Text>
              <Text style={tw("text-xs text-gray-500")}>Delivered in safe tamper-proof packaging</Text>
            </View>
          </View>

          <View style={tw("flex-row items-center gap-3")}>
            <View style={tw("w-10 h-10 rounded-full bg-purple-50 items-center justify-center")}>
              <RotateCcw size={20} color="#7c3aed" />
            </View>
            <View style={tw("flex-1")}>
              <Text style={tw("text-xs font-bold text-gray-900")}>7-Day Replacement Policy</Text>
              <Text style={tw("text-xs text-gray-500")}>Peace of mind guaranteed</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={tw("absolute bottom-0 left-0 right-0 bg-surface p-4 border-t border-gray-100 flex-row items-center gap-3 shadow-lg")}>
        <View style={tw("flex-row items-center bg-gray-100 rounded-full px-3 py-2 gap-3")}>
          <Pressable
            onPress={() => setQty(Math.max(1, qty - 1))}
            style={({ pressed }) => [tw("p-1 cursor-pointer"), pressed && { opacity: 0.6 }]}
          >
            <Minus size={14} color={colors.gray800} />
          </Pressable>
          <Text style={tw("text-xs font-extrabold text-gray-900 min-w-6 text-center")}>
            {qty}
          </Text>
          <Pressable
            onPress={() => setQty(qty + 1)}
            style={({ pressed }) => [tw("p-1 cursor-pointer"), pressed && { opacity: 0.6 }]}
          >
            <Plus size={14} color={colors.gray800} />
          </Pressable>
        </View>

        <Pressable
          onPress={handleAddToCart}
          style={({ pressed }) => [
            tw("flex-1 flex-row items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 h-12 rounded-full cursor-pointer"),
            pressed && { transform: [{ scale: 0.96 }] },
          ]}
        >
          <ShoppingBag size={18} color={colors.brandDark} />
          <Text style={tw("text-xs font-extrabold text-brand-dark")}>Add to Cart</Text>
        </Pressable>

        <Pressable
          onPress={handleBuyNow}
          style={({ pressed }) => [
            tw("flex-1 flex-row items-center justify-center gap-1.5 bg-brand h-12 rounded-full shadow-md cursor-pointer"),
            pressed && { transform: [{ scale: 0.96 }] },
          ]}
        >
          <Zap size={16} color="white" />
          <Text style={tw("text-white text-xs font-extrabold")}>Buy Now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
