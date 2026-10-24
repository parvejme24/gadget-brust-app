import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Banknote,
  Check,
  CreditCard,
  Home,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Tag,
  Truck,
  User,
  X,
} from "lucide-react-native";
import FormField from "@/components/FormField";
import ErrorState from "@/components/ErrorState";
import { usePaymentMethods, useShippingMethods } from "@/hooks/useStorefront";
import { errorMessage, orderService } from "@/services/orderService";
import { recentOrders, savedContact } from "@/lib/recentOrders";
import { addressBook } from "@/lib/addressBook";
import { payOrder } from "@/lib/payOrder";
import { clearCart } from "@/store/slices/shopSlice";
import { formatTaka, getFinalPrice } from "@/lib/format";
import AppBackground from "@/components/AppBackground";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;

const METHOD_STYLE = {
  cash_on_delivery: { icon: Banknote, color: "#047857", bg: "#d1fae5", hint: "Pay with cash when it arrives" },
  ssl_commerz: { icon: Smartphone, color: "#1d4ed8", bg: "#dbeafe", hint: "bKash · Nagad · Rocket · Cards" },
  stripe: { icon: CreditCard, color: "#6d28d9", bg: "#ede9fe", hint: "Visa · Mastercard · Amex" },
};

function Section({ step, title, icon: Icon, children, right }) {
  return (
    <View style={tw("glass rounded-2xl p-4")}>
      <View style={tw("flex-row items-center justify-between mb-3")}>
        <View style={tw("flex-row items-center gap-2")}>
          <View style={[tw("w-6 h-6 rounded-full items-center justify-center"), { backgroundColor: colors.brand }]}>
            <Text style={[tw("text-white font-black"), { fontSize: 11 }]}>{step}</Text>
          </View>
          <Text style={tw("text-sm font-extrabold text-gray-900")}>{title}</Text>
          {Icon && <Icon size={14} color={colors.gray400} />}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

function OptionCard({ selected, disabled, onPress, children }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        tw("flex-row items-center gap-3 p-3 rounded-2xl mb-2 cursor-pointer"),
        {
          borderWidth: 1.5,
          borderColor: selected ? colors.brand : colors.gray100,
          backgroundColor: selected ? colors.brandLight : "#ffffff",
          opacity: disabled ? 0.5 : 1,
        },
        pressed && { transform: [{ scale: 0.99 }] },
      ]}
    >
      {children}
      <View
        style={[
          tw("w-5 h-5 rounded-full items-center justify-center"),
          selected ? { backgroundColor: colors.brand } : { borderWidth: 1.5, borderColor: colors.gray300 },
        ]}
      >
        {selected && <Check size={12} color="#fff" strokeWidth={3.2} />}
      </View>
    </Pressable>
  );
}

function SummaryRow({ label, value, accent, bold }) {
  return (
    <View style={tw("flex-row justify-between items-center")}>
      <Text style={[tw(bold ? "text-sm font-extrabold text-gray-900" : "text-xs text-gray-500 font-medium"), accent && { color: colors.brandDark }]}>
        {label}
      </Text>
      <Text style={[tw(bold ? "font-black text-gray-900" : "text-xs font-bold text-gray-900"), bold && { fontSize: 18 }, accent && { color: colors.brandDark }]}>
        {value}
      </Text>
    </View>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const cart = useSelector((s) => s.shop?.cart || []);
  const user = useSelector((s) => s.auth?.user);

  const { data: shippingMethods = [], isLoading: loadingShipping } = useShippingMethods();
  const { data: paymentMethods = [] } = usePaymentMethods();

  const [contact, setContact] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    street: "",
    city: "",
    zipCode: "",
    notes: "",
  });
  const [shippingId, setShippingId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [formError, setFormError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState(null);

  // Refresh after visiting Manage addresses
  useFocusEffect(
    useCallback(() => {
      addressBook.list().then(setAddresses);
    }, [])
  );

  const pickAddress = (a) => {
    setAddressId(a.id);
    setContact((c) => ({ ...c, name: a.name || c.name, phone: a.phone || c.phone, street: a.street, city: a.city, zipCode: a.zipCode || "", notes: a.note || c.notes }));
  };

  // Prefill the default saved address, else the last one used on this device (account details win for name/phone/email)
  useEffect(() => {
    Promise.all([addressBook.list(), savedContact.read()]).then(([book, saved]) => {
      setAddresses(book);
      const preferred = book.find((a) => a.isDefault);
      if (preferred) {
        setAddressId(preferred.id);
        setContact((c) => ({
          ...c,
          name: c.name || preferred.name || "",
          phone: c.phone || preferred.phone || "",
          email: c.email || saved?.email || "",
          street: preferred.street,
          city: preferred.city,
          zipCode: preferred.zipCode || "",
        }));
        return;
      }
      if (!saved) return;
      setContact((c) => ({
        ...c,
        name: c.name || saved.name || "",
        phone: c.phone || saved.phone || "",
        email: c.email || saved.email || "",
        street: saved.street || "",
        city: saved.city || "",
        zipCode: saved.zipCode || "",
      }));
    });
  }, []);

  const activeShipping = shippingMethods.filter((m) => m.isActive !== false);
  const selectedShipping = shippingId || activeShipping[0]?._id;
  const items = useMemo(() => cart.map((i) => ({ product: i._id, qty: i.qty })), [cart]);

  // Server-side price: the exact amount checkout will charge
  const quote = useQuery({
    queryKey: ["quote", items, selectedShipping, couponCode],
    queryFn: () => orderService.quote({ items, shippingMethod: selectedShipping, couponCode: couponCode || undefined }),
    enabled: items.length > 0 && !!selectedShipping,
    retry: false,
  });

  const localSubtotal = cart.reduce((sum, i) => sum + getFinalPrice(i) * i.qty, 0);
  const total = quote.data?.total ?? localSubtotal;

  const set = (key) => (value) => {
    if (["street", "city", "zipCode"].includes(key)) setAddressId(null);
    setContact((c) => ({ ...c, [key]: value }));
  };

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      await orderService.quote({ items, shippingMethod: selectedShipping, couponCode: code });
      setCouponCode(code);
    } catch (err) {
      setCouponError(errorMessage(err, "This code can't be used"));
    } finally {
      setApplyingCoupon(false);
    }
  };

  const validate = () => {
    if (!contact.name.trim()) return "Enter your full name";
    if (!BD_PHONE.test(contact.phone.replace(/[\s-]/g, ""))) return "Enter a valid mobile number (01XXXXXXXXX)";
    if (contact.email && !/^\S+@\S+\.\S+$/.test(contact.email.trim())) return "Enter a valid email address";
    if (!contact.street.trim() || !contact.city.trim()) return "Enter your delivery address and city";
    if (!selectedShipping) return "Choose a delivery option";
    return "";
  };

  const placeOrder = async () => {
    const problem = validate();
    setFormError(problem);
    if (problem) return;

    setPlacing(true);
    const phone = contact.phone.replace(/[\s-]/g, "");
    try {
      const order = await orderService.placeOrder({
        customer: { name: contact.name.trim(), phone, email: contact.email.trim() },
        shippingAddress: { street: contact.street.trim(), city: contact.city.trim(), zipCode: contact.zipCode.trim(), country: "Bangladesh" },
        shippingMethod: selectedShipping,
        couponCode: couponCode || undefined,
        paymentMethod,
        notes: contact.notes.trim(),
        items,
      });

      await recentOrders.add({ number: order.invoiceNumber, phone, total: order.total, placedAt: new Date().toISOString() });
      savedContact.save({ name: contact.name, phone, email: contact.email, street: contact.street, city: contact.city, zipCode: contact.zipCode });
      addressBook.remember({ name: contact.name.trim(), phone, street: contact.street.trim(), city: contact.city.trim(), zipCode: contact.zipCode.trim() });
      dispatch(clearCart());
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });

      const params = { number: order.invoiceNumber, phone, placed: "1" };
      if (paymentMethod !== "cash_on_delivery") {
        try {
          const updated = await payOrder({ number: order.invoiceNumber, phone, method: paymentMethod });
          if (!updated) return; // web: the browser is on its way to the gateway
        } catch (err) {
          params.payError = errorMessage(err, "Couldn't open the payment page");
        }
      }
      router.replace({ pathname: "/track", params });
    } catch (err) {
      setFormError(errorMessage(err, "Couldn't place your order"));
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0 && !placing) {
    return (
      <SafeAreaView style={tw("flex-1 bg-canvas")}>
        <AppBackground />
        <View style={tw("flex-1 items-center justify-center p-6")}>
          <ErrorState type="empty-cart" onAction={() => router.replace("/")} />
        </View>
      </SafeAreaView>
    );
  }

  const payLabel = paymentMethod === "cash_on_delivery" ? "Place order" : `Pay ${formatTaka(total)}`;

  return (
    <SafeAreaView style={tw("flex-1 bg-canvas")}>
      <AppBackground />
      {/* Header */}
      <View style={tw("flex-row items-center gap-3 px-4 py-3 glass-strong border-b border-gray-100")}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
          style={tw("w-10 h-10 rounded-xl bg-gray-50 items-center justify-center cursor-pointer")}
        >
          <ArrowLeft size={19} color={colors.gray900} />
        </Pressable>
        <View style={tw("flex-1")}>
          <Text style={tw("text-base font-black text-gray-900")}>Checkout</Text>
          <Text style={[tw("text-gray-500 font-medium"), { fontSize: 11 }]}>
            {cart.reduce((s, i) => s + i.qty, 0)} items · {formatTaka(total)}
          </Text>
        </View>
        <View style={[tw("flex-row items-center gap-1 px-2.5 py-1 rounded-full"), { backgroundColor: colors.brandLight }]}>
          <Lock size={11} color={colors.brandDark} strokeWidth={2.6} />
          <Text style={[tw("font-bold text-brand-dark"), { fontSize: 10 }]}>Secure</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={tw("flex-1")} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={tw("p-4 gap-3 pb-8")} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* 1. Contact */}
          <Section step={1} title="Contact details" icon={User}>
            <View style={tw("gap-3")}>
              <FormField label="Full name" icon={User} value={contact.name} onChangeText={set("name")} placeholder="Your name" autoComplete="name" />
              <FormField
                label="Mobile number"
                icon={Phone}
                value={contact.phone}
                onChangeText={set("phone")}
                placeholder="01XXXXXXXXX"
                keyboardType="phone-pad"
                autoComplete="tel"
              />
              <FormField
                label="Email"
                optional
                icon={Mail}
                value={contact.email}
                onChangeText={set("email")}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </Section>

          {/* 2. Address */}
          <Section
            step={2}
            title="Delivery address"
            icon={MapPin}
            right={
              <Pressable onPress={() => router.push("/addresses")} hitSlop={6} style={tw("cursor-pointer")}>
                <Text style={tw("text-xs font-bold text-brand-dark")}>Manage</Text>
              </Pressable>
            }
          >
            {addresses.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw("gap-2 pb-3")}>
                {addresses.map((a) => {
                  const active = addressId === a.id;
                  return (
                    <Pressable
                      key={a.id}
                      onPress={() => pickAddress(a)}
                      style={[
                        tw("px-3 py-2 rounded-xl cursor-pointer"),
                        { width: 170, borderWidth: 1.5, borderColor: active ? colors.brand : colors.gray100, backgroundColor: active ? colors.brandLight : "#fff" },
                      ]}
                    >
                      <View style={tw("flex-row items-center justify-between")}>
                        <Text style={[tw("text-xs font-extrabold"), { color: active ? colors.brandDark : colors.gray900 }]}>{(a.label === "Other" && a.placeName) || (a.label === "Office" && a.company) || a.label}</Text>
                        {active && <Check size={13} color={colors.brandDark} strokeWidth={3} />}
                      </View>
                      <Text numberOfLines={2} style={[tw("text-gray-500 font-medium mt-0.5"), { fontSize: 11 }]}>
                        {[a.street, a.city].filter(Boolean).join(", ")}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
            <View style={tw("gap-3")}>
              <FormField label="House, road & area" icon={Home} value={contact.street} onChangeText={set("street")} placeholder="House 12, Road 5, Dhanmondi" />
              <View style={tw("flex-row gap-3")}>
                <FormField style={tw("flex-1")} label="City" value={contact.city} onChangeText={set("city")} placeholder="Dhaka" />
                <FormField style={{ width: 120 }} label="Post code" optional value={contact.zipCode} onChangeText={set("zipCode")} placeholder="1209" keyboardType="number-pad" />
              </View>
              <FormField label="Note for delivery" optional value={contact.notes} onChangeText={set("notes")} placeholder="e.g. Call before coming" />
            </View>
          </Section>

          {/* 3. Delivery option */}
          <Section step={3} title="Delivery option" icon={Truck}>
            {loadingShipping ? (
              <ActivityIndicator color={colors.brand} />
            ) : activeShipping.length === 0 ? (
              <Text style={tw("text-xs text-gray-500")}>No delivery options are available right now.</Text>
            ) : (
              activeShipping.map((m) => {
                const free = m.freeShippingThreshold > 0 && localSubtotal >= m.freeShippingThreshold;
                const tooSmall = m.minOrderAmount > 0 && localSubtotal < m.minOrderAmount;
                const days = m.estimatedDays ? (m.estimatedDays.min === m.estimatedDays.max ? `${m.estimatedDays.min} day` : `${m.estimatedDays.min}–${m.estimatedDays.max} days`) : "";
                return (
                  <OptionCard key={m._id} selected={selectedShipping === m._id} disabled={tooSmall} onPress={() => setShippingId(m._id)}>
                    <View style={tw("flex-1")}>
                      <Text style={tw("text-xs font-extrabold text-gray-900")}>{m.name}</Text>
                      <Text numberOfLines={2} style={[tw("text-gray-500 font-medium mt-0.5"), { fontSize: 11 }]}>
                        {tooSmall ? `Needs an order of ${formatTaka(m.minOrderAmount)}+` : m.description || days}
                      </Text>
                      {!!days && !tooSmall && <Text style={[tw("font-bold mt-0.5"), { fontSize: 10, color: colors.brandDark }]}>Arrives in {days}</Text>}
                    </View>
                    <Text style={[tw("text-xs font-black"), { color: free ? colors.brandDark : colors.gray900 }]}>
                      {free ? "FREE" : formatTaka(m.baseCharge)}
                    </Text>
                  </OptionCard>
                );
              })
            )}
          </Section>

          {/* 4. Payment */}
          <Section step={4} title="Payment method" icon={ShieldCheck}>
            {(paymentMethods.length ? paymentMethods : [{ id: "cash_on_delivery", name: "Cash on Delivery", enabled: true }]).map((m) => {
              const style = METHOD_STYLE[m.id] || METHOD_STYLE.cash_on_delivery;
              const Icon = style.icon;
              return (
                <OptionCard key={m.id} selected={paymentMethod === m.id} disabled={!m.enabled} onPress={() => setPaymentMethod(m.id)}>
                  <View style={[tw("w-10 h-10 rounded-xl items-center justify-center"), { backgroundColor: style.bg }]}>
                    <Icon size={19} color={style.color} strokeWidth={2.2} />
                  </View>
                  <View style={tw("flex-1")}>
                    <Text style={tw("text-xs font-extrabold text-gray-900")}>{m.name}</Text>
                    <Text style={[tw("text-gray-500 font-medium mt-0.5"), { fontSize: 11 }]}>{m.enabled ? style.hint : "Not available right now"}</Text>
                  </View>
                </OptionCard>
              );
            })}
            {paymentMethod !== "cash_on_delivery" && (
              <View style={[tw("flex-row items-center gap-1.5 p-2.5 rounded-xl mt-1"), { backgroundColor: colors.gray50 }]}>
                <Lock size={12} color={colors.gray500} />
                <Text style={[tw("text-gray-500 font-medium flex-1"), { fontSize: 11 }]}>
                  {`You'll finish paying on the secure ${paymentMethod === "stripe" ? "Stripe" : "SSLCommerz"} page, then come back here.`}
                </Text>
              </View>
            )}
          </Section>

          {/* Coupon */}
          <View style={[tw("bg-surface rounded-2xl p-4"), { borderWidth: 1.5, borderStyle: "dashed", borderColor: couponCode ? colors.brand : colors.gray200 }]}>
            <View style={tw("flex-row items-center gap-2 mb-2.5")}>
              <Tag size={15} color={colors.brandDark} />
              <Text style={tw("text-xs font-extrabold text-gray-900")}>Promo code</Text>
            </View>
            {couponCode ? (
              <View style={[tw("flex-row items-center justify-between px-3 rounded-xl"), { height: 44, backgroundColor: colors.brandLight }]}>
                <Text style={[tw("text-xs font-black text-brand-dark"), { letterSpacing: 1 }]}>
                  {couponCode} {quote.data?.discount ? `· −${formatTaka(quote.data.discount)}` : ""}
                </Text>
                <Pressable onPress={() => setCouponCode("")} hitSlop={8} style={tw("cursor-pointer")}>
                  <X size={16} color={colors.brandDark} />
                </Pressable>
              </View>
            ) : (
              <View style={tw("flex-row gap-2")}>
                <TextInput
                  value={couponInput}
                  onChangeText={(t) => {
                    setCouponInput(t);
                    setCouponError("");
                  }}
                  placeholder="Enter code"
                  placeholderTextColor={colors.gray400}
                  autoCapitalize="characters"
                  style={[tw("flex-1 px-3 rounded-xl text-xs font-bold text-gray-900"), { height: 44, backgroundColor: colors.gray50, letterSpacing: 1 }]}
                />
                <Pressable
                  onPress={applyCoupon}
                  disabled={applyingCoupon || !couponInput.trim()}
                  style={[tw("px-4 rounded-xl items-center justify-center cursor-pointer"), { height: 44, backgroundColor: colors.gray900, opacity: couponInput.trim() ? 1 : 0.5 }]}
                >
                  {applyingCoupon ? <ActivityIndicator size="small" color="#fff" /> : <Text style={tw("text-white text-xs font-bold")}>Apply</Text>}
                </Pressable>
              </View>
            )}
            {!!couponError && <Text style={[tw("text-xs font-semibold mt-2"), { color: colors.red500 }]}>{couponError}</Text>}
          </View>

          {/* Summary */}
          <View style={tw("glass rounded-2xl p-4 gap-2.5")}>
            <Text style={tw("text-sm font-extrabold text-gray-900")}>Order summary</Text>
            <View style={tw("flex-row gap-1.5 flex-wrap")}>
              {cart.slice(0, 6).map((i) => (
                <View key={i._id} style={[tw("rounded-xl items-center justify-center"), { width: 46, height: 46, backgroundColor: colors.gray50 }]}>
                  <Image source={i.image?.url} style={{ width: "78%", height: "78%" }} contentFit="contain" />
                  {i.qty > 1 && (
                    <View style={[tw("absolute rounded-full items-center justify-center"), { top: -4, right: -4, minWidth: 16, height: 16, backgroundColor: colors.gray900 }]}>
                      <Text style={[tw("text-white font-black"), { fontSize: 9 }]}>{i.qty}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {quote.isFetching && !quote.data ? (
              <ActivityIndicator color={colors.brand} style={tw("my-2")} />
            ) : quote.isError ? (
              <Text style={[tw("text-xs font-semibold"), { color: colors.red500 }]}>{errorMessage(quote.error, "Couldn't price your order")}</Text>
            ) : (
              <>
                <SummaryRow label="Subtotal" value={formatTaka(quote.data?.subtotal ?? localSubtotal)} />
                <SummaryRow
                  label="Delivery"
                  value={quote.data ? (quote.data.shippingCharge ? formatTaka(quote.data.shippingCharge) : "FREE") : "—"}
                  accent={quote.data && !quote.data.shippingCharge}
                />
                {!!quote.data?.discount && <SummaryRow label={`Promo (${quote.data.coupon?.code || couponCode})`} value={`−${formatTaka(quote.data.discount)}`} accent />}
                <View style={[tw("my-0.5"), { height: 1, backgroundColor: colors.gray100 }]} />
                <SummaryRow label="Total payable" value={formatTaka(total)} bold />
              </>
            )}
          </View>

          {!!formError && (
            <View style={[tw("p-3 rounded-xl"), { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" }]}>
              <Text style={[tw("text-xs font-bold"), { color: "#b91c1c" }]}>{formError}</Text>
            </View>
          )}
        </ScrollView>

        {/* Sticky place-order bar */}
        <View style={tw("flex-row items-center gap-3 px-4 py-3 glass-strong border-t border-gray-100")}>
          <View>
            <Text style={[tw("text-gray-500 font-medium"), { fontSize: 11 }]}>Total</Text>
            <Text style={[tw("font-black text-gray-900"), { fontSize: 18 }]}>{formatTaka(total)}</Text>
          </View>
          <Pressable
            onPress={placeOrder}
            disabled={placing || quote.isError}
            style={({ pressed }) => [
              tw("flex-1 flex-row items-center justify-center gap-2 rounded-2xl cursor-pointer"),
              { height: 52, backgroundColor: quote.isError ? colors.gray300 : colors.brand },
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
          >
            {placing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                {paymentMethod === "cash_on_delivery" ? <Check size={17} color="#fff" strokeWidth={3} /> : <Lock size={16} color="#fff" strokeWidth={2.6} />}
                <Text style={tw("text-white text-sm font-extrabold")}>{payLabel}</Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
