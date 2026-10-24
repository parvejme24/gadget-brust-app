import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import {
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react-native";
import { clearCart, removeFromCart, updateCartQty } from "@/store/slices/shopSlice";
import { useShippingMethods } from "@/hooks/useStorefront";
import ErrorState from "./ErrorState";
import ScreenHeader from "./ScreenHeader";
import { NAV_SPACE } from "./BottomNav";
import { formatTaka, getFinalPrice } from "@/lib/format";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const TINTS = ["#e8f7f1", "#eaf1ff", "#f4ecff", "#fff4e0", "#ffecf3", "#e6f7fb"];

export default function CartView({ onExplore }) {
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.shop?.cart || []);
  const router = useRouter();
  const { data: shippingMethods = [] } = useShippingMethods();

  const subtotal = cart.reduce((sum, item) => sum + getFinalPrice(item) * item.qty, 0);
  // Free-delivery goal from the cheapest delivery option that offers one (exact charge is priced at checkout)
  const FREE_SHIPPING_MIN = shippingMethods
    .filter((m) => m.isActive !== false && m.freeShippingThreshold > 0)
    .reduce((min, m) => Math.min(min, m.freeShippingThreshold), Infinity);
  const hasFreeShippingGoal = Number.isFinite(FREE_SHIPPING_MIN);

  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const savings = cart.reduce((sum, i) => sum + Math.max(0, (i.price || 0) - getFinalPrice(i)) * i.qty, 0);
  const freeShippingLeft = hasFreeShippingGoal ? Math.max(0, FREE_SHIPPING_MIN - subtotal) : 0;
  const shippingProgress = hasFreeShippingGoal ? Math.min(1, subtotal / FREE_SHIPPING_MIN) : 0;

  const renderCartItem = ({ item, index }) => {
    const price = getFinalPrice(item);
    const maxQty = item.stock || 99;
    const brandName = typeof item.brand === "object" ? item.brand?.brandName : null;

    return (
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          padding: 10,
          borderRadius: 20,
          backgroundColor: colors.glass,
          borderColor: colors.glassBorder,
          borderWidth: 1,
          shadowColor: "#0f172a",
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 16,
            backgroundColor: TINTS[index % TINTS.length],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image source={item.image?.url} style={{ width: "78%", height: "78%" }} contentFit="contain" transition={200} />
          {item.discount > 0 && (
            <View style={[tw("absolute top-1.5 left-1.5 px-1.5 rounded-full"), { backgroundColor: colors.red500, paddingVertical: 1 }]}>
              <Text style={[tw("text-white font-black"), { fontSize: 9 }]}>-{item.discount}%</Text>
            </View>
          )}
        </View>

        <View style={tw("flex-1 justify-between")}>
          <View style={tw("flex-row items-start gap-2")}>
            <View style={tw("flex-1")}>
              {!!brandName && (
                <Text style={[tw("font-extrabold text-brand-dark"), { fontSize: 10, letterSpacing: 0.6 }]}>
                  {brandName.toUpperCase()}
                </Text>
              )}
              <Text numberOfLines={2} style={[tw("text-xs font-bold text-gray-900"), { lineHeight: 16 }]}>
                {item.title}
              </Text>
            </View>
            <Pressable
              onPress={() => dispatch(removeFromCart(item._id))}
              hitSlop={6}
              style={({ pressed }) => [
                tw("w-7 h-7 rounded-full items-center justify-center cursor-pointer"),
                { backgroundColor: colors.gray50 },
                pressed && { backgroundColor: "#fee2e2" },
              ]}
            >
              <X size={13} color={colors.gray500} strokeWidth={2.6} />
            </Pressable>
          </View>

          <View style={tw("flex-row items-end justify-between mt-2")}>
            <View>
              {price < item.price && (
                <Text style={[tw("text-gray-400 font-medium"), { fontSize: 10, textDecorationLine: "line-through" }]}>
                  {formatTaka(item.price)}
                </Text>
              )}
              <Text style={[tw("font-black text-gray-900"), { fontSize: 15 }]}>{formatTaka(price * item.qty)}</Text>
              {item.qty > 1 && (
                <Text style={[tw("text-gray-500 font-medium"), { fontSize: 10 }]}>{formatTaka(price)} each</Text>
              )}
            </View>

            {/* Quantity stepper */}
            <View
              style={[
                tw("flex-row items-center rounded-xl"),
                { padding: 3, gap: 4, backgroundColor: colors.brandLight, borderWidth: 1, borderColor: "#bfe8d6" },
              ]}
            >
              <Pressable
                onPress={() =>
                  item.qty > 1 ? dispatch(updateCartQty({ id: item._id, qty: item.qty - 1 })) : dispatch(removeFromCart(item._id))
                }
                hitSlop={4}
                style={({ pressed }) => [
                  tw("items-center justify-center bg-white rounded-lg cursor-pointer"),
                  { width: 28, height: 26 },
                  pressed && { transform: [{ scale: 0.88 }] },
                ]}
              >
                {item.qty <= 1 ? (
                  <Trash2 size={12} color={colors.red500} strokeWidth={2.4} />
                ) : (
                  <Minus size={13} color={colors.brandDark} strokeWidth={2.8} />
                )}
              </Pressable>
              <Text style={[tw("text-xs font-black text-brand-dark text-center"), { minWidth: 18 }]}>{item.qty}</Text>
              <Pressable
                onPress={() => item.qty < maxQty && dispatch(updateCartQty({ id: item._id, qty: item.qty + 1 }))}
                disabled={item.qty >= maxQty}
                hitSlop={4}
                style={({ pressed }) => [
                  tw("items-center justify-center rounded-lg cursor-pointer"),
                  { width: 28, height: 26, backgroundColor: item.qty >= maxQty ? colors.gray200 : colors.brand },
                  pressed && { transform: [{ scale: 0.88 }] },
                ]}
              >
                <Plus size={13} color="#fff" strokeWidth={2.8} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Rendered as an element (not an inline component) so it isn't remounted on every render
  const listFooter = (
    <View style={tw("mt-1 gap-3 pb-6")}>
      {/* Bill summary */}
      <View style={tw("glass p-4 rounded-2xl gap-2.5")}>
        <Text style={tw("text-sm font-extrabold text-gray-900 mb-0.5")}>Order Summary</Text>

        <View style={tw("flex-row justify-between")}>
          <Text style={tw("text-xs text-gray-500 font-medium")}>Subtotal ({itemCount} items)</Text>
          <Text style={tw("text-xs font-bold text-gray-900")}>{formatTaka(subtotal)}</Text>
        </View>
        <View style={tw("flex-row justify-between")}>
          <Text style={tw("text-xs text-gray-500 font-medium")}>Delivery & promo codes</Text>
          <Text style={tw("text-xs font-bold text-gray-500")}>At checkout</Text>
        </View>

        <View style={[tw("my-1"), { height: 1, backgroundColor: colors.gray100 }]} />

        <View style={tw("flex-row justify-between items-center")}>
          <Text style={tw("text-sm font-extrabold text-gray-900")}>Subtotal</Text>
          <Text style={[tw("font-black text-gray-900"), { fontSize: 18 }]}>{formatTaka(subtotal)}</Text>
        </View>

        {savings > 0 && (
          <View style={[tw("flex-row items-center gap-1.5 p-2.5 rounded-xl"), { backgroundColor: colors.brandLight }]}>
            <Sparkles size={14} color={colors.brandDark} />
            <Text style={[tw("text-xs font-bold"), { color: colors.brandDark }]}>
              {`You're saving ${formatTaka(savings)} on this order`}
            </Text>
          </View>
        )}
        <View style={tw("flex-row items-center gap-1.5")}>
          <ShieldCheck size={13} color={colors.gray500} />
          <Text style={[tw("text-gray-500 font-medium"), { fontSize: 11 }]}>Official warranty included on all items</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={tw("flex-1 bg-canvas")}>
      <ScreenHeader
        id="cart-hero"
        title="My Cart"
        subtitle={cart.length > 0 ? `${itemCount} ${itemCount === 1 ? "item" : "items"} · ${formatTaka(subtotal)}` : "Your bag is waiting to be filled"}
        actionLabel="Clear"
        actionIcon={Trash2}
        onAction={cart.length > 0 ? () => dispatch(clearCart()) : undefined}
      >
        {/* Free delivery progress */}
        {cart.length > 0 && hasFreeShippingGoal && (
          <View style={[tw("mt-3 p-3 rounded-2xl"), { backgroundColor: "rgba(255,255,255,0.12)" }]}>
            <View style={tw("flex-row items-center gap-1.5")}>
              <Truck size={14} color="#fff" />
              <Text style={tw("text-white text-xs font-bold")}>
                {freeShippingLeft > 0 ? `Add ${formatTaka(freeShippingLeft)} more for FREE delivery` : "You've unlocked FREE delivery 🎉"}
              </Text>
            </View>
            <View style={[tw("mt-2 rounded-full overflow-hidden"), { height: 6, backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <View style={{ width: `${shippingProgress * 100}%`, height: "100%", borderRadius: 3, backgroundColor: "#ffb46b" }} />
            </View>
          </View>
        )}
      </ScreenHeader>

      {cart.length === 0 ? (
        <View style={tw("flex-1 items-center justify-center p-6")}>
          <ErrorState type="empty-cart" onAction={onExplore} />
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item._id}
            contentContainerStyle={tw("p-4 gap-3")}
            renderItem={renderCartItem}
            ListFooterComponent={listFooter}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />

          {/* Sticky checkout bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingHorizontal: 16,
              paddingVertical: 6,
              backgroundColor: colors.glassStrong,
              borderTopWidth: 1,
              borderTopColor: colors.gray100,
              // sit just above the floating nav bar
              marginBottom: NAV_SPACE - 10,
            }}
          >
            <View>
              <Text style={[tw("text-gray-500 font-medium"), { fontSize: 10, lineHeight: 12 }]}>Subtotal</Text>
              <Text style={[tw("font-black text-gray-900"), { fontSize: 15, lineHeight: 19 }]}>{formatTaka(subtotal)}</Text>
            </View>
            <Pressable
              onPress={() => router.push("/checkout")}
              style={({ pressed }) => [
                tw("flex-1 flex-row items-center justify-center gap-1.5 rounded-xl cursor-pointer"),
                {
                  height: 40,
                  backgroundColor: colors.brand,
                  shadowColor: colors.brand,
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 3,
                },
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={tw("text-white text-xs font-extrabold")}>Checkout</Text>
              <ArrowRight size={15} color="#fff" strokeWidth={2.6} />
            </Pressable>
          </View>
        </>
      )}

    </View>
  );
}
