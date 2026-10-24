import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Linking, Platform, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition, useAnimatedStyle, withTiming } from "react-native-reanimated";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  PackageSearch,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react-native";
import FormField from "@/components/FormField";
import HeroBackground from "@/components/HeroBackground";
import { useStoreSettings } from "@/hooks/useStorefront";
import { storefrontService } from "@/services/storefrontService";
import { errorMessage } from "@/services/orderService";
import AppBackground from "@/components/AppBackground";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const FAQS = [
  {
    icon: Truck,
    q: "How long does delivery take?",
    a: "Inside Dhaka most orders arrive in 1–2 days; outside Dhaka in 2–5 days. You'll see the exact estimate for each delivery option at checkout.",
  },
  {
    icon: ShieldCheck,
    q: "Are your products genuine with warranty?",
    a: "Yes. Every product is 100% original and comes with the official brand warranty. Keep your invoice — it's your warranty proof.",
  },
  {
    icon: RotateCcw,
    q: "Can I return or replace a product?",
    a: "If an item arrives damaged or not as described, contact us within 7 days of delivery and we'll arrange a replacement or refund.",
  },
  {
    icon: MessageCircle,
    q: "How do I claim warranty service?",
    a: "Send us your order number and a short description of the problem using the form below or call our helpline. We'll guide you to the nearest authorised service centre.",
  },
  {
    icon: PackageSearch,
    q: "How can I track my order?",
    a: "Open Track Order and enter your order number with the phone number you used at checkout. Orders placed on this device are listed there automatically.",
  },
];

const SUBJECTS = ["Order issue", "Warranty claim", "Return / refund", "Product question", "Other"];

// Slides a block in on mount, staggered by `delay`
function Reveal({ delay = 0, style, children }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(16)} style={style}>
      {children}
    </Animated.View>
  );
}

function FaqItem({ item, open, onToggle, first }) {
  const Icon = item.icon;
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(open ? "180deg" : "0deg", { duration: 220 }) }],
  }));

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(18)}
      style={[
        tw("rounded-xl overflow-hidden"),
        !first && !open && { borderTopWidth: 1, borderTopColor: colors.gray50 },
        open && { backgroundColor: colors.brandLight, marginVertical: 4 },
      ]}
    >
      <Pressable onPress={onToggle} style={[tw("flex-row items-center gap-3 py-3 cursor-pointer"), { paddingHorizontal: open ? 10 : 0 }]}>
        <View style={[tw("w-8 h-8 rounded-lg items-center justify-center"), { backgroundColor: open ? colors.brand : colors.brandLight }]}>
          <Icon size={15} color={open ? "#fff" : colors.brandDark} />
        </View>
        <Text style={[tw("flex-1 text-xs font-bold"), { color: open ? colors.brandDark : colors.gray900 }]}>{item.q}</Text>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={16} color={open ? colors.brandDark : colors.gray400} />
        </Animated.View>
      </Pressable>
      {open && (
        <Animated.View entering={FadeInDown.duration(240)} exiting={FadeOut.duration(120)} style={{ paddingLeft: 54, paddingRight: 12, paddingBottom: 12 }}>
          <Text style={[tw("text-gray-600 font-medium"), { fontSize: 12, lineHeight: 18 }]}>{item.a}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

export default function SupportScreen() {
  const router = useRouter();
  const user = useSelector((s) => s.auth?.user);
  const { data: settings = {} } = useStoreSettings();
  const [hero, setHero] = useState({ width: 0, height: 0 });
  const [openFaq, setOpenFaq] = useState(0);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", subject: SUBJECTS[0], message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const phone = settings.phone || "+880 1700-000000";
  const email = settings.email || "support@gadgetbrust.com";
  const dialable = phone.replace(/[^\d+]/g, "");
  const whatsapp = dialable.replace(/^\+/, "");

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const send = async () => {
    setError("");
    if (!form.name.trim()) return setError("Enter your name");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Enter a valid email so we can reply");
    if (form.message.trim().length < 10) return setError("Tell us a little more (at least 10 characters)");
    setSending(true);
    try {
      await storefrontService.sendContactMessage({ ...form, name: form.name.trim(), email: form.email.trim(), message: form.message.trim() });
      setSent(true);
      setForm((f) => ({ ...f, message: "" }));
    } catch (err) {
      setError(errorMessage(err, "Couldn't send your message"));
    } finally {
      setSending(false);
    }
  };

  const quickActions = [
    { label: "Call us", desc: phone, icon: Phone, color: "#047857", bg: "#d1fae5", onPress: () => Linking.openURL(`tel:${dialable}`) },
    { label: "WhatsApp", desc: "Chat instantly", icon: MessageCircle, color: "#15803d", bg: "#dcfce7", onPress: () => Linking.openURL(`https://wa.me/${whatsapp}`) },
    { label: "Email", desc: email, icon: Mail, color: "#1d4ed8", bg: "#dbeafe", onPress: () => Linking.openURL(`mailto:${email}`) },
  ];

  return (
    <SafeAreaView style={tw("flex-1 bg-canvas")}>
      <AppBackground />
      <KeyboardAvoidingView style={tw("flex-1")} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={tw("pb-10")} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View
            onLayout={(e) => setHero({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
            style={{ borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden", paddingHorizontal: 18, paddingTop: 12, paddingBottom: 56 }}
          >
            <HeroBackground id="support-hero" width={hero.width} height={hero.height} />
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
              style={[tw("w-10 h-10 rounded-xl items-center justify-center cursor-pointer"), { backgroundColor: "rgba(255,255,255,0.16)" }]}
            >
              <ArrowLeft size={19} color="#fff" />
            </Pressable>
            <Animated.Text entering={FadeInDown.delay(60).springify()} style={[tw("text-white font-black mt-4"), { fontSize: 24 }]}>
              How can we help?
            </Animated.Text>
            <Animated.Text entering={FadeIn.delay(160)} style={[tw("text-xs font-medium mt-1"), { color: "rgba(255,255,255,0.82)" }]}>
              Our gadget experts are here {settings.hours ? `· ${settings.hours}` : "every day"}
            </Animated.Text>
          </View>

          {/* Quick contact */}
          <View style={[tw("flex-row gap-2.5 mx-4"), { marginTop: -36 }]}>
            {quickActions.map(({ label, desc, icon: Icon, color, bg, onPress }, idx) => (
              <Reveal key={label} delay={120 + idx * 80} style={tw("flex-1")}>
                <Pressable
                  onPress={onPress}
                  style={({ pressed }) => [
                    {
                      alignItems: "center",
                      paddingVertical: 14,
                      paddingHorizontal: 6,
                      borderRadius: 20,
                      // solid: these overlap the green hero, which would show through glass
                      backgroundColor: "#ffffff",
                      borderWidth: 1,
                      borderColor: colors.glassBorder,
                      shadowColor: "#0f3d2e",
                      shadowOpacity: 0.12,
                      shadowRadius: 14,
                      shadowOffset: { width: 0, height: 6 },
                    },
                    tw("cursor-pointer"),
                    pressed && { transform: [{ scale: 0.96 }] },
                  ]}
                >
                  <View style={[tw("w-11 h-11 rounded-2xl items-center justify-center"), { backgroundColor: bg }]}>
                    <Icon size={20} color={color} strokeWidth={2.2} />
                  </View>
                  <Text style={tw("text-xs font-extrabold text-gray-900 mt-2")}>{label}</Text>
                  <Text numberOfLines={1} style={[tw("text-gray-500 font-medium mt-0.5"), { fontSize: 10 }]}>
                    {desc}
                  </Text>
                </Pressable>
              </Reveal>
            ))}
          </View>

          <View style={tw("px-4 mt-4 gap-3")}>
            {/* Track shortcut */}
            <Reveal delay={360}>
              <Pressable
                onPress={() => router.push("/track")}
                style={({ pressed }) => [
                  tw("flex-row items-center gap-3 p-4 rounded-2xl cursor-pointer"),
                  { backgroundColor: "#ede9fe" },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <PackageSearch size={22} color="#6d28d9" />
                <View style={tw("flex-1")}>
                  <Text style={[tw("text-xs font-extrabold"), { color: "#4c1d95" }]}>Where is my order?</Text>
                  <Text style={[tw("font-medium mt-0.5"), { fontSize: 11, color: "#6d28d9" }]}>Track delivery status live</Text>
                </View>
                <Text style={[tw("text-xs font-black"), { color: "#6d28d9" }]}>Track →</Text>
              </Pressable>
            </Reveal>

            {/* Store info */}
            <Reveal delay={440} style={tw("glass rounded-2xl p-4 gap-3")}>
              <View style={tw("flex-row items-start gap-3")}>
                <MapPin size={16} color={colors.brandDark} style={{ marginTop: 1 }} />
                <View style={tw("flex-1")}>
                  <Text style={tw("text-xs font-extrabold text-gray-900")}>Visit our store</Text>
                  <Text style={[tw("text-gray-500 font-medium mt-0.5"), { fontSize: 12 }]}>{settings.address || "Dhaka, Bangladesh"}</Text>
                </View>
              </View>
              <View style={tw("flex-row items-start gap-3")}>
                <Clock size={16} color={colors.brandDark} style={{ marginTop: 1 }} />
                <View style={tw("flex-1")}>
                  <Text style={tw("text-xs font-extrabold text-gray-900")}>Opening hours</Text>
                  <Text style={[tw("text-gray-500 font-medium mt-0.5"), { fontSize: 12 }]}>{settings.hours || "Sat - Thu, 10:00 AM - 8:00 PM"}</Text>
                </View>
              </View>
            </Reveal>

            {/* FAQ */}
            <Reveal delay={520} style={tw("glass rounded-2xl px-4 pt-4 pb-2")}>
              <Text style={tw("text-sm font-extrabold text-gray-900 mb-2")}>Frequently asked questions</Text>
              {FAQS.map((item, idx) => (
                <FaqItem key={item.q} item={item} first={idx === 0} open={openFaq === idx} onToggle={() => setOpenFaq(openFaq === idx ? -1 : idx)} />
              ))}
            </Reveal>

            {/* Contact form */}
            <Reveal delay={600} style={tw("glass rounded-2xl p-4")}>
              <Text style={tw("text-sm font-extrabold text-gray-900")}>Send us a message</Text>
              <Text style={[tw("text-gray-500 font-medium mt-0.5 mb-3"), { fontSize: 11 }]}>We usually reply within a few hours.</Text>

              {sent ? (
                <Animated.View entering={FadeInDown.springify().damping(14)} style={[tw("items-center p-5 rounded-2xl"), { backgroundColor: colors.brandLight }]}>
                  <CheckCircle2 size={34} color={colors.brandDark} />
                  <Text style={tw("text-sm font-extrabold text-gray-900 mt-2")}>Message sent!</Text>
                  <Text style={[tw("text-gray-600 font-medium text-center mt-1"), { fontSize: 12 }]}>
                    {`We'll get back to you at ${form.email}.`}
                  </Text>
                  <Pressable onPress={() => setSent(false)} style={tw("mt-3 px-4 py-2 rounded-full bg-white cursor-pointer")}>
                    <Text style={tw("text-xs font-bold text-brand-dark")}>Send another</Text>
                  </Pressable>
                </Animated.View>
              ) : (
                <View style={tw("gap-3")}>
                  <FormField label="Your name" icon={User} value={form.name} onChangeText={set("name")} placeholder="Full name" />
                  <FormField label="Email" icon={Mail} value={form.email} onChangeText={set("email")} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
                  <FormField label="Phone" optional icon={Phone} value={form.phone} onChangeText={set("phone")} placeholder="01XXXXXXXXX" keyboardType="phone-pad" />

                  <View>
                    <Text style={[tw("font-bold text-gray-700 mb-1.5"), { fontSize: 11 }]}>Topic</Text>
                    <View style={tw("flex-row flex-wrap gap-1.5")}>
                      {SUBJECTS.map((s) => {
                        const active = form.subject === s;
                        return (
                          <Pressable
                            key={s}
                            onPress={() => set("subject")(s)}
                            style={[
                              tw("px-3 py-1.5 rounded-full cursor-pointer"),
                              { borderWidth: 1, borderColor: active ? colors.brand : colors.gray200, backgroundColor: active ? colors.brand : "#fff" },
                            ]}
                          >
                            <Text style={[tw("text-xs font-bold"), { color: active ? "#fff" : colors.gray600 }]}>{s}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <FormField
                    label="Message"
                    value={form.message}
                    onChangeText={set("message")}
                    placeholder="Include your order number if it's about an order"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    inputStyle={{ minHeight: 96 }}
                  />

                  {!!error && <Text style={[tw("text-xs font-bold"), { color: colors.red500 }]}>{error}</Text>}

                  <Pressable
                    onPress={send}
                    disabled={sending}
                    style={[tw("flex-row items-center justify-center gap-2 rounded-2xl cursor-pointer"), { height: 50, backgroundColor: colors.brand }]}
                  >
                    {sending ? <ActivityIndicator color="#fff" /> : <Send size={16} color="#fff" />}
                    <Text style={tw("text-white text-sm font-extrabold")}>Send message</Text>
                  </Pressable>
                </View>
              )}
            </Reveal>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
