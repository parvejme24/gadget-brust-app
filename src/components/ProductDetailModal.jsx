import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import BlurBackdrop from "@/components/BlurBackdrop";
import AppBackground from "@/components/AppBackground";
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
import { useProductReviews } from "@/hooks/useStorefront";
import { formatTaka, getFinalPrice } from "@/lib/format";
import tw from "@/lib/tw";
import { colors } from "@/theme";

export default function ProductDetailModal({ visible, product, onClose, onGoToCart }) {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.shop?.wishlist || []);
  const isWishlisted = product ? wishlist.some((item) => item._id === product._id) : false;

  const [qty, setQty] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  // Load live reviews from /api/reviews/product/:id
  const { data: reviews = [] } = useProductReviews(product?._id);
  const rating = reviews.length ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : Number(product?.star) || 0;

  if (!product) return null;

  const price = getFinalPrice(product);
  const savings = Math.max(0, (product.price || price) - price);

  const handleAddToCart = () => {
    dispatch(addToCart({ product, qty }));
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ product, qty }));
    onClose();
    onGoToCart?.();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      {/* Outer wrapper */}
      <View style={tw("flex-1 justify-end items-center")}>
        {/* Backdrop: soft blur over the screen behind; tap to close */}
        <BlurBackdrop onPress={onClose} />
        <Animated.View
          entering={SlideInDown.springify().damping(18).stiffness(160)}
          style={[
            tw("w-full flex-1 bg-canvas mt-12 rounded-t-3xl overflow-hidden shadow-2xl"),
            { maxWidth: 480 },
          ]}
        >
          <AppBackground />
          {/* Top Bar */}
          <View style={tw("p-4 glass-strong flex-row items-center justify-between border-b border-gray-100 shadow-sm")}>
            <Pressable
              onPress={onClose}
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

            {/* Wishlist Button */}
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

          {/* Toast Notification */}
          {addedToast && (
            <View style={tw("bg-emerald-600 p-2.5 mx-4 mt-2 rounded-xl flex-row items-center justify-center gap-2 shadow-md")}>
              <CheckCircle2 size={16} color="white" />
              <Text style={tw("text-white text-xs font-bold")}>
                Added {qty} {qty > 1 ? "items" : "item"} to your cart!
              </Text>
            </View>
          )}

          {/* Scrollable Details */}
          <ScrollView contentContainerStyle={tw("p-4 pb-32 gap-4")} showsVerticalScrollIndicator={false}>
            {/* Main Product Showcase Image */}
            <View style={tw("w-full h-64 rounded-3xl glass items-center justify-center p-6 shadow-sm relative")}>
              <Image
                source={product.image?.url}
                style={{ width: "92%", height: "92%" }}
                contentFit="contain"
                transition={200}
              />
              {product.discount > 0 && (
                <View style={tw("absolute top-4 left-4 bg-red-500 px-3 py-1 rounded-full shadow-sm")}>
                  <Text style={tw("text-white text-xs font-extrabold")}>-{product.discount}% OFF</Text>
                </View>
              )}
            </View>

            {/* Title & Brand */}
            <View style={tw("glass p-4 rounded-2xl gap-2")}>
              <View style={tw("flex-row items-center justify-between")}>
                <View style={tw("bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200")}>
                  <Text style={tw("text-xs font-bold text-brand-dark")}>Official Warranty</Text>
                </View>
                <View style={tw("flex-row items-center gap-1")}>
                  <Star size={14} color={colors.amber500} fill={colors.amber500} />
                  <Text style={tw("text-xs font-bold text-gray-900")}>{rating ? rating.toFixed(1) : "New"}</Text>
                  <Text style={tw("text-xs text-gray-400")}>({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</Text>
                </View>
              </View>

              <Text style={tw("text-lg font-extrabold text-gray-900 leading-6")}>
                {product.title}
              </Text>

              {/* Price Bar */}
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

            {/* Key Specifications & Features */}
            <View style={tw("glass p-4 rounded-2xl gap-3")}>
              <Text style={tw("text-sm font-bold text-gray-900")}>Specifications & Features</Text>

              <View style={tw("gap-2")}>
                {product.keyFeatures && product.keyFeatures.length > 0 ? (
                  product.keyFeatures.map((kf, i) => (
                    <View key={i} style={tw("flex-row justify-between py-1.5 border-b border-gray-50")}>
                      <Text style={tw("text-xs text-gray-500 font-medium")}>{kf.key}</Text>
                      <Text style={tw("text-xs text-gray-900 font-bold")}>{kf.values?.join(", ")}</Text>
                    </View>
                  ))
                ) : (
                  <>
                    <View style={tw("flex-row justify-between py-1.5 border-b border-gray-50")}>
                      <Text style={tw("text-xs text-gray-500 font-medium")}>Condition</Text>
                      <Text style={tw("text-xs text-gray-900 font-bold")}>100% Brand New, Factory Sealed</Text>
                    </View>
                    <View style={tw("flex-row justify-between py-1.5 border-b border-gray-50")}>
                      <Text style={tw("text-xs text-gray-500 font-medium")}>Warranty</Text>
                      <Text style={tw("text-xs text-brand font-bold")}>1 Year Official Brand Warranty</Text>
                    </View>
                    <View style={tw("flex-row justify-between py-1.5 border-b border-gray-50")}>
                      <Text style={tw("text-xs text-gray-500 font-medium")}>Origin</Text>
                      <Text style={tw("text-xs text-gray-900 font-bold")}>Authorized Distributor Stock</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Customer Reviews from API */}
            {reviews && reviews.length > 0 && (
              <View style={tw("glass p-4 rounded-2xl gap-3")}>
                <View style={tw("flex-row items-center justify-between")}>
                  <Text style={tw("text-sm font-bold text-gray-900")}>Customer Reviews ({reviews.length})</Text>
                  <View style={tw("flex-row items-center gap-1")}>
                    <Star size={12} color={colors.amber500} fill={colors.amber500} />
                    <Text style={tw("text-xs font-bold text-gray-900")}>{rating.toFixed(1)}</Text>
                  </View>
                </View>

                <View style={tw("gap-2.5")}>
                  {reviews.slice(0, 3).map((rev, idx) => (
                    <View key={rev._id || idx} style={tw("p-3 bg-gray-50 rounded-xl border border-gray-100")}>
                      <View style={tw("flex-row justify-between items-center mb-1")}>
                        <Text style={tw("text-xs font-bold text-gray-900")}>{rev.customerName || "Verified Buyer"}</Text>
                        <View style={tw("flex-row items-center gap-0.5")}>
                          <Star size={10} color={colors.amber500} fill={colors.amber500} />
                          <Text style={tw("text-[10px] font-bold text-gray-700")}>{rev.rating}</Text>
                        </View>
                      </View>
                      <Text style={tw("text-xs text-gray-600 leading-4")}>{rev.reviewText}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Trust Badges */}
            <View style={tw("glass p-4 rounded-2xl gap-3")}>
              <View style={tw("flex-row items-center gap-3")}>
                <View style={tw("w-10 h-10 rounded-full bg-emerald-50 items-center justify-center")}>
                  <ShieldCheck size={20} color={colors.brand} />
                </View>
                <View style={tw("flex-1")}>
                  <Text style={tw("text-xs font-bold text-gray-900")}>Genuine Device Guarantee</Text>
                  <Text style={tw("text-xs text-gray-500")}>Verified IMEI / Serial Number with official warranty card</Text>
                </View>
              </View>

              <View style={tw("flex-row items-center gap-3")}>
                <View style={tw("w-10 h-10 rounded-full bg-blue-50 items-center justify-center")}>
                  <Truck size={20} color="#2563eb" />
                </View>
                <View style={tw("flex-1")}>
                  <Text style={tw("text-xs font-bold text-gray-900")}>Fast & Secure Delivery</Text>
                  <Text style={tw("text-xs text-gray-500")}>24h Delivery inside Dhaka • 48h across Bangladesh</Text>
                </View>
              </View>

              <View style={tw("flex-row items-center gap-3")}>
                <View style={tw("w-10 h-10 rounded-full bg-purple-50 items-center justify-center")}>
                  <RotateCcw size={20} color="#7c3aed" />
                </View>
                <View style={tw("flex-1")}>
                  <Text style={tw("text-xs font-bold text-gray-900")}>7-Day Replacement</Text>
                  <Text style={tw("text-xs text-gray-500")}>Instant replacement if hardware defect is found</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom Action Bar */}
          <View style={tw("absolute bottom-0 left-0 right-0 glass-strong p-4 border-t border-gray-100 flex-row items-center gap-3 shadow-lg")}>
            {/* Quantity Stepper */}
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

            {/* Add to Cart button */}
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

            {/* Buy Now button */}
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
        </Animated.View>
      </View>
    </Modal>
  );
}
