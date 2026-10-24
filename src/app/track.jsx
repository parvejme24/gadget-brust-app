import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, RefreshControl, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Image } from "expo-image";
import {
  Banknote,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  Hash,
  Home,
  Lock,
  PackageCheck,
  PackageSearch,
  Phone,
  Truck,
  XCircle,
} from "lucide-react-native";
import FormField from "@/components/FormField";
import ScreenHeader from "@/components/ScreenHeader";
import { useMyOrders, usePaymentMethods, useTrackOrder } from "@/hooks/useStorefront";
import { errorMessage, orderService } from "@/services/orderService";
import { recentOrders } from "@/lib/recentOrders";
import { payOrder } from "@/lib/payOrder";
import { ORDER_STATUS, ORDER_STEPS, PAYMENT_LABELS, awaitsOnlinePayment, formatDateTime, isPaid } from "@/lib/orderStatus";
import { formatTaka } from "@/lib/format";
import AppBackground from "@/components/AppBackground";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const card = "glass rounded-2xl p-4";

// Placed → Accepted → Shipped → Delivered, or a cancelled banner
function ProgressSteps({ order }) {
  if (order.orderStatus === "cancelled") {
    return (
      <View style={[tw("flex-row items-center gap-3 p-3.5 rounded-2xl"), { backgroundColor: "#fef2f2" }]}>
        <XCircle size={22} color="#b91c1c" />
        <View style={tw("flex-1")}>
          <Text style={[tw("text-sm font-extrabold"), { color: "#b91c1c" }]}>This order was cancelled</Text>
          <Text style={[tw("font-medium mt-0.5"), { fontSize: 11, color: "#991b1b" }]}>Contact support if you have any questions.</Text>
        </View>
      </View>
    );
  }

  const current = Math.max(0, ORDER_STEPS.findIndex((s) => s.id === order.orderStatus));
  const at = (status) => order.statusHistory?.filter((h) => h.status === status).pop()?.at;

  return (
    <View>
      {ORDER_STEPS.map((step, idx) => {
        const done = idx <= current;
        const active = idx === current;
        const last = idx === ORDER_STEPS.length - 1;
        const when = at(step.id) || (idx === 0 ? order.orderDate : null);
        return (
          <View key={step.id} style={tw("flex-row gap-3")}>
            <View style={tw("items-center")}>
              <View
                style={[
                  tw("w-8 h-8 rounded-full items-center justify-center"),
                  done ? { backgroundColor: colors.brand } : { backgroundColor: colors.gray50, borderWidth: 1.5, borderColor: colors.gray200 },
                  active && { shadowColor: colors.brand, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
                ]}
              >
                {done ? <Check size={15} color="#fff" strokeWidth={3} /> : <Text style={[tw("font-black text-gray-400"), { fontSize: 11 }]}>{idx + 1}</Text>}
              </View>
              {!last && <View style={{ width: 2, flex: 1, minHeight: 22, backgroundColor: idx < current ? colors.brand : colors.gray100 }} />}
            </View>
            <View style={[tw("flex-1"), { paddingBottom: last ? 0 : 14, paddingTop: 5 }]}>
              <Text style={[tw("text-xs font-extrabold"), { color: done ? colors.gray900 : colors.gray400 }]}>{step.label}</Text>
              <Text style={[tw("font-medium mt-0.5"), { fontSize: 11, color: done ? colors.gray500 : colors.gray300 }]}>
                {when && done ? formatDateTime(when) : step.desc}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function PaymentCard({ order, number, phone, onChanged }) {
  const { data: methods = [] } = usePaymentMethods();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const paid = isPaid(order);
  const awaiting = awaitsOnlinePayment(order);
  const onlineEnabled = methods.filter((m) => m.enabled && m.id !== "cash_on_delivery");

  const pay = async (method) => {
    setBusy(method);
    setError("");
    try {
      const updated = await payOrder({ number, phone, method });
      if (updated) onChanged();
    } catch (err) {
      setError(errorMessage(err, "Couldn't open the payment page"));
    } finally {
      setBusy("");
    }
  };

  const switchToCod = async () => {
    setBusy("cod");
    setError("");
    try {
      await orderService.switchToCod({ invoiceNumber: number, phone });
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy("");
    }
  };

  const Icon = order.paymentMethod === "cash_on_delivery" ? Banknote : CreditCard;

  return (
    <View style={tw(card)}>
      <View style={tw("flex-row items-center gap-3")}>
        <View style={[tw("w-10 h-10 rounded-xl items-center justify-center"), { backgroundColor: paid ? "#d1fae5" : "#fef3c7" }]}>
          <Icon size={19} color={paid ? "#047857" : "#b45309"} />
        </View>
        <View style={tw("flex-1")}>
          <Text style={tw("text-xs font-extrabold text-gray-900")}>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</Text>
          <Text style={[tw("font-semibold mt-0.5"), { fontSize: 11, color: paid ? "#047857" : "#b45309" }]}>
            {paid
              ? "Paid"
              : order.paymentMethod === "cash_on_delivery"
                ? `Pay ${formatTaka(order.total)} on delivery`
                : order.orderStatus === "cancelled"
                  ? "Not paid"
                  : "Waiting for payment"}
          </Text>
        </View>
        <Text style={tw("text-sm font-black text-gray-900")}>{formatTaka(order.total)}</Text>
      </View>

      {awaiting && (
        <View style={tw("mt-3 gap-2")}>
          {onlineEnabled.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => pay(m.id)}
              disabled={!!busy}
              style={({ pressed }) => [
                tw("flex-row items-center justify-center gap-2 rounded-xl cursor-pointer"),
                { height: 46, backgroundColor: m.id === order.paymentMethod ? colors.brand : colors.gray900 },
                pressed && { opacity: 0.85 },
              ]}
            >
              {busy === m.id ? <ActivityIndicator color="#fff" /> : <Lock size={14} color="#fff" strokeWidth={2.6} />}
              <Text style={tw("text-white text-xs font-extrabold")}>
                Pay {formatTaka(order.total)} with {m.id === "stripe" ? "card (Stripe)" : "SSLCommerz"}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={switchToCod}
            disabled={!!busy}
            style={({ pressed }) => [
              tw("flex-row items-center justify-center gap-2 rounded-xl cursor-pointer"),
              { height: 44, borderWidth: 1.5, borderColor: colors.gray200 },
              pressed && { opacity: 0.7 },
            ]}
          >
            {busy === "cod" ? <ActivityIndicator color={colors.gray700} /> : <Banknote size={15} color={colors.gray700} />}
            <Text style={tw("text-xs font-bold text-gray-700")}>Pay with cash on delivery instead</Text>
          </Pressable>
        </View>
      )}
      {!!error && <Text style={[tw("text-xs font-semibold mt-2"), { color: colors.red500 }]}>{error}</Text>}
    </View>
  );
}

function OrderDetails({ number, phone, placed, payError }) {
  const { data: order, isLoading, isError, error, refetch, isRefetching } = useTrackOrder({ number, phone });

  if (isLoading) return <ActivityIndicator color={colors.brand} style={tw("mt-16")} />;
  if (isError) {
    return (
      <View style={[tw(card), tw("m-4 items-center")]}>
        <PackageSearch size={30} color={colors.gray400} />
        <Text style={tw("text-sm font-extrabold text-gray-900 mt-2 text-center")}>{errorMessage(error, "We couldn't look up that order")}</Text>
        <Pressable onPress={() => refetch()} style={tw("mt-3 px-4 py-2 rounded-full bg-gray-900 cursor-pointer")}>
          <Text style={tw("text-white text-xs font-bold")}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const status = ORDER_STATUS[order.orderStatus] || ORDER_STATUS.pending;
  const shipment = order.shipment;
  const trackUrl = shipment?.trackingUrl && shipment.trackingNumber ? shipment.trackingUrl.replace("{tracking}", encodeURIComponent(shipment.trackingNumber)) : null;
  const unpaidOnline = awaitsOnlinePayment(order);

  return (
    <ScrollView
      contentContainerStyle={tw("pb-10")}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.brand} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={tw("p-4 gap-3")}>
        {placed && <PlacedBanner order={order} unpaidOnline={unpaidOnline} />}

        {!!payError && (
          <View style={[tw("p-3 rounded-xl"), { backgroundColor: "#fef2f2" }]}>
            <Text style={[tw("text-xs font-bold"), { color: "#b91c1c" }]}>{payError}</Text>
          </View>
        )}

        {/* Order heading */}
        <View style={tw(card)}>
          <View style={tw("flex-row items-start justify-between")}>
            <View>
              <Text style={[tw("text-gray-500 font-semibold"), { fontSize: 11 }]}>Order number</Text>
              <Text style={[tw("font-black text-gray-900 mt-0.5"), { fontSize: 16, letterSpacing: 0.4 }]}>{order.invoiceNumber}</Text>
              <Text style={[tw("text-gray-500 font-medium mt-0.5"), { fontSize: 11 }]}>Placed {formatDateTime(order.orderDate)}</Text>
            </View>
            <View style={[tw("px-2.5 py-1 rounded-full"), { backgroundColor: status.bg }]}>
              <Text style={[tw("font-black"), { fontSize: 11, color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <View style={[tw("my-4"), { height: 1, backgroundColor: colors.gray50 }]} />
          <ProgressSteps order={order} />
        </View>

        <PaymentCard order={order} number={number} phone={phone} onChanged={refetch} />

        {/* Courier */}
        {shipment && (
          <View style={tw(card)}>
            <View style={tw("flex-row items-center gap-3")}>
              <View style={[tw("w-10 h-10 rounded-xl items-center justify-center"), { backgroundColor: "#ede9fe" }]}>
                <Truck size={19} color="#6d28d9" />
              </View>
              <View style={tw("flex-1")}>
                <Text style={tw("text-xs font-extrabold text-gray-900")}>{shipment.courier}</Text>
                {!!shipment.trackingNumber && (
                  <Text style={[tw("text-gray-500 font-semibold mt-0.5"), { fontSize: 11 }]}>Tracking no. {shipment.trackingNumber}</Text>
                )}
              </View>
              {!!shipment.phone && (
                <Pressable onPress={() => Linking.openURL(`tel:${shipment.phone}`)} style={tw("w-9 h-9 rounded-xl bg-gray-50 items-center justify-center cursor-pointer")}>
                  <Phone size={16} color={colors.gray700} />
                </Pressable>
              )}
            </View>
            {!!trackUrl && (
              <Pressable
                onPress={() => Linking.openURL(trackUrl)}
                style={[tw("mt-3 flex-row items-center justify-center gap-1.5 rounded-xl cursor-pointer"), { height: 42, backgroundColor: "#ede9fe" }]}
              >
                <ExternalLink size={14} color="#6d28d9" />
                <Text style={[tw("text-xs font-extrabold"), { color: "#6d28d9" }]}>Track with courier</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Items + bill */}
        <View style={tw(card)}>
          <Text style={tw("text-sm font-extrabold text-gray-900 mb-3")}>Items ({order.items.length})</Text>
          {order.items.map((it, idx) => (
            <View key={`${it.title}-${idx}`} style={[tw("flex-row items-center gap-3 py-2"), idx > 0 && { borderTopWidth: 1, borderTopColor: colors.gray50 }]}>
              <View style={[tw("rounded-xl items-center justify-center"), { width: 48, height: 48, backgroundColor: colors.gray50 }]}>
                {!!it.image && <Image source={it.image} style={{ width: "78%", height: "78%" }} contentFit="contain" />}
              </View>
              <View style={tw("flex-1")}>
                <Text numberOfLines={2} style={tw("text-xs font-bold text-gray-900")}>{it.title}</Text>
                <Text style={[tw("text-gray-500 font-medium mt-0.5"), { fontSize: 11 }]}>
                  {it.qty} × {formatTaka(it.price)}
                </Text>
              </View>
              <Text style={tw("text-xs font-black text-gray-900")}>{formatTaka(it.price * it.qty)}</Text>
            </View>
          ))}
          <View style={[tw("my-2"), { height: 1, backgroundColor: colors.gray100 }]} />
          <View style={tw("gap-1.5")}>
            <View style={tw("flex-row justify-between")}>
              <Text style={tw("text-xs text-gray-500 font-medium")}>Subtotal</Text>
              <Text style={tw("text-xs font-bold text-gray-900")}>{formatTaka(order.subtotal)}</Text>
            </View>
            {!!order.discount && (
              <View style={tw("flex-row justify-between")}>
                <Text style={[tw("text-xs font-medium"), { color: colors.brandDark }]}>Discount</Text>
                <Text style={[tw("text-xs font-bold"), { color: colors.brandDark }]}>−{formatTaka(order.discount)}</Text>
              </View>
            )}
            <View style={tw("flex-row justify-between")}>
              <Text style={tw("text-xs text-gray-500 font-medium")}>Delivery{order.city ? ` · ${order.city}` : ""}</Text>
              <Text style={tw("text-xs font-bold text-gray-900")}>{order.shippingCharge ? formatTaka(order.shippingCharge) : "FREE"}</Text>
            </View>
            <View style={tw("flex-row justify-between mt-1")}>
              <Text style={tw("text-sm font-extrabold text-gray-900")}>Total</Text>
              <Text style={[tw("font-black text-gray-900"), { fontSize: 16 }]}>{formatTaka(order.total)}</Text>
            </View>
          </View>
        </View>

        {/* Activity log */}
        {order.statusHistory?.length > 0 && (
          <View style={tw(card)}>
            <Text style={tw("text-sm font-extrabold text-gray-900 mb-3")}>Order activity</Text>
            {[...order.statusHistory].reverse().map((h, idx) => (
              <View key={`${h.status}-${h.at}-${idx}`} style={tw("flex-row gap-2.5 mb-2.5")}>
                <Clock size={13} color={colors.gray400} style={{ marginTop: 2 }} />
                <View style={tw("flex-1")}>
                  <Text style={tw("text-xs font-bold text-gray-900")}>{ORDER_STATUS[h.status]?.label || h.status}</Text>
                  {!!h.note && <Text style={[tw("text-gray-500 font-medium"), { fontSize: 11 }]}>{h.note}</Text>}
                  <Text style={[tw("text-gray-400 font-medium"), { fontSize: 10 }]}>{formatDateTime(h.at)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function PlacedBanner({ order, unpaidOnline }) {
  const paid = isPaid(order);
  const tone = unpaidOnline ? { color: "#b45309", bg: "#fef3c7", ring: "#fde68a" } : { color: colors.brandDark, bg: colors.brandLight, ring: "#bfe8d6" };
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(14)}
      style={[tw("flex-row items-center gap-3 p-4 rounded-2xl"), { backgroundColor: tone.bg, borderWidth: 1, borderColor: tone.ring }]}
    >
      <View style={tw("w-12 h-12 rounded-full items-center justify-center bg-white")}>
        {unpaidOnline ? <Clock size={24} color={tone.color} /> : <PackageCheck size={24} color={tone.color} />}
      </View>
      <View style={tw("flex-1")}>
        <Text style={[tw("text-sm font-black"), { color: tone.color }]}>
          {unpaidOnline ? "Order saved — payment pending" : "Order placed successfully!"}
        </Text>
        <Text style={[tw("font-medium mt-0.5"), { fontSize: 11, color: tone.color, opacity: 0.85 }]}>
          {unpaidOnline
            ? "Complete the payment below so we can start packing."
            : paid
              ? "Payment received. We'll start packing your order shortly."
              : "We'll call you to confirm. Keep your order number handy."}
        </Text>
      </View>
    </Animated.View>
  );
}

// No order chosen yet: lookup form + this device's / account's recent orders
function TrackLookup({ onOpen }) {
  const user = useSelector((s) => s.auth?.user);
  const { data: myOrders = [] } = useMyOrders(Boolean(user));
  const [form, setForm] = useState({ number: "", phone: "" });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    recentOrders.list().then(setRecent);
  }, []);

  const accountOrders = Array.isArray(myOrders)
    ? myOrders.map((o) => ({ number: o.invoiceNumber, phone: o.phone || o.customer?.phone, total: o.total, placedAt: o.orderDate || o.createdAt, status: o.orderStatus }))
    : [];
  const merged = [...accountOrders, ...recent.filter((r) => !accountOrders.some((a) => a.number === r.number))];

  return (
    <ScrollView contentContainerStyle={tw("p-4 gap-3 pb-10")} keyboardShouldPersistTaps="handled">
      <View style={tw(card)}>
        <Text style={tw("text-sm font-extrabold text-gray-900")}>Find your order</Text>
        <Text style={[tw("text-gray-500 font-medium mt-0.5 mb-3"), { fontSize: 11 }]}>Use the order number and the phone number from checkout.</Text>
        <View style={tw("gap-3")}>
          <FormField
            label="Order number"
            icon={Hash}
            value={form.number}
            onChangeText={(number) => setForm((f) => ({ ...f, number }))}
            placeholder="INV-20261024-0001"
            autoCapitalize="characters"
          />
          <FormField
            label="Phone number"
            icon={Phone}
            value={form.phone}
            onChangeText={(phone) => setForm((f) => ({ ...f, phone }))}
            placeholder="01XXXXXXXXX"
            keyboardType="phone-pad"
          />
          <Pressable
            onPress={() => onOpen({ number: form.number.trim().toUpperCase(), phone: form.phone.trim() })}
            disabled={!form.number.trim() || !form.phone.trim()}
            style={[
              tw("flex-row items-center justify-center gap-2 rounded-xl cursor-pointer"),
              { height: 48, backgroundColor: colors.gray900, opacity: form.number.trim() && form.phone.trim() ? 1 : 0.5 },
            ]}
          >
            <PackageSearch size={16} color="#fff" />
            <Text style={tw("text-white text-sm font-extrabold")}>Track order</Text>
          </Pressable>
        </View>
      </View>

      {merged.length > 0 && (
        <View style={tw(card)}>
          <Text style={tw("text-sm font-extrabold text-gray-900 mb-2")}>Your recent orders</Text>
          {merged.map((o, idx) => {
            const st = o.status ? ORDER_STATUS[o.status] : null;
            return (
              <Pressable
                key={o.number}
                onPress={() => o.phone && onOpen({ number: o.number, phone: o.phone })}
                style={({ pressed }) => [
                  tw("flex-row items-center gap-3 py-3 cursor-pointer"),
                  idx > 0 && { borderTopWidth: 1, borderTopColor: colors.gray50 },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <View style={[tw("w-9 h-9 rounded-xl items-center justify-center"), { backgroundColor: colors.brandLight }]}>
                  <PackageCheck size={17} color={colors.brandDark} />
                </View>
                <View style={tw("flex-1")}>
                  <Text style={tw("text-xs font-extrabold text-gray-900")}>{o.number}</Text>
                  <Text style={[tw("text-gray-500 font-medium mt-0.5"), { fontSize: 11 }]}>
                    {o.placedAt ? formatDateTime(o.placedAt) : ""} {o.total ? `· ${formatTaka(o.total)}` : ""}
                  </Text>
                </View>
                {st && (
                  <View style={[tw("px-2 py-0.5 rounded-full"), { backgroundColor: st.bg }]}>
                    <Text style={[tw("font-bold"), { fontSize: 10, color: st.color }]}>{st.label}</Text>
                  </View>
                )}
                <ChevronRight size={16} color={colors.gray400} />
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

export default function TrackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const number = typeof params.number === "string" ? params.number : "";
  const phone = typeof params.phone === "string" ? params.phone : "";
  const placed = params.placed === "1";

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/"));

  return (
    <SafeAreaView style={tw("flex-1 bg-canvas")}>
      <AppBackground />
      <ScreenHeader
        id="track-hero"
        title={number ? "Order details" : "Track order"}
        subtitle={number ? number : "Use your order number and checkout phone"}
        onBack={goBack}
        actionLabel={number ? "Find another" : undefined}
        actionIcon={PackageSearch}
        onAction={number ? () => router.replace("/track") : undefined}
      />
      {!!number && !!phone ? (
        <>
          <OrderDetails number={number} phone={phone} placed={placed} payError={typeof params.payError === "string" ? params.payError : ""} />
          {placed && (
            <View style={tw("px-4 py-3 glass-strong border-t border-gray-100")}>
              <Pressable
                onPress={() => router.replace("/")}
                style={[tw("flex-row items-center justify-center gap-2 rounded-2xl cursor-pointer"), { height: 50, backgroundColor: colors.brand }]}
              >
                <Home size={16} color="#fff" />
                <Text style={tw("text-white text-sm font-extrabold")}>Continue shopping</Text>
              </Pressable>
            </View>
          )}
        </>
      ) : (
        <TrackLookup onOpen={(p) => router.push({ pathname: "/track", params: p })} />
      )}
    </SafeAreaView>
  );
}
