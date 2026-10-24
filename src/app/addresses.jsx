import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  SlideInDown,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  Briefcase,
  Building2,
  Check,
  Clock,
  Home,
  Landmark,
  MapPin,
  Navigation,
  Pencil,
  Phone,
  Plus,
  Star,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react-native";
import BlurBackdrop from "@/components/BlurBackdrop";
import FormField from "@/components/FormField";
import ScreenHeader from "@/components/ScreenHeader";
import { addressBook } from "@/lib/addressBook";
import AppBackground from "@/components/AppBackground";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;
const DELIVERY_WINDOWS = ["9 AM – 1 PM", "1 PM – 5 PM", "5 PM – 9 PM", "Any time"];

const LABELS = [
  { id: "Home", icon: Home, color: "#047857", bg: "#d1fae5", hint: "Where you live — we'll deliver to your door" },
  { id: "Office", icon: Briefcase, color: "#1d4ed8", bg: "#dbeafe", hint: "Your workplace — add the company and floor so the courier finds you" },
  { id: "Other", icon: MapPin, color: "#6d28d9", bg: "#ede9fe", hint: "Anywhere else — a relative's home, a friend's place, a pickup point" },
];
const labelStyle = (label) => LABELS.find((l) => l.id === label) || LABELS[2];

// Each address type asks only for what a courier needs there
const FIELDS = {
  Home: [
    { key: "name", label: "Receiver's name", icon: User, placeholder: "Full name", required: "Enter the receiver's name" },
    { key: "phone", label: "Mobile number", icon: Phone, placeholder: "01XXXXXXXXX", keyboardType: "phone-pad", phone: true },
    { key: "house", label: "House / flat no.", icon: Home, placeholder: "House 12, Flat 4B", required: "Enter the house or flat number" },
    { key: "area", label: "Road & area", icon: Navigation, placeholder: "Road 5, Dhanmondi", required: "Enter the road and area" },
    { row: true },
    { key: "landmark", label: "Nearby landmark", icon: Landmark, placeholder: "Opposite Dhanmondi Lake", optional: true },
  ],
  Office: [
    { key: "company", label: "Company / office name", icon: Building2, placeholder: "Acme Technologies Ltd.", required: "Enter the company or office name" },
    { key: "name", label: "Receiver's name", icon: User, placeholder: "Who should collect it?", required: "Enter the receiver's name" },
    { key: "phone", label: "Mobile number", icon: Phone, placeholder: "01XXXXXXXXX", keyboardType: "phone-pad", phone: true },
    { key: "house", label: "Building, floor & desk", icon: Building2, placeholder: "Level 6, Navana Tower", required: "Enter the building and floor" },
    { key: "area", label: "Road & area", icon: Navigation, placeholder: "Gulshan Avenue, Gulshan 1", required: "Enter the road and area" },
    { row: true },
    { key: "deliveryTime", label: "Best time to deliver", chips: DELIVERY_WINDOWS },
  ],
  Other: [
    { key: "placeName", label: "Name this place", icon: Tag, placeholder: "e.g. Mom's house, Friend's flat", required: "Give this place a name" },
    { key: "name", label: "Receiver's name", icon: User, placeholder: "Full name", required: "Enter the receiver's name" },
    { key: "phone", label: "Mobile number", icon: Phone, placeholder: "01XXXXXXXXX", keyboardType: "phone-pad", phone: true },
    { key: "area", label: "Full address", icon: Navigation, placeholder: "House, road and area", required: "Enter the full address" },
    { row: true },
    { key: "landmark", label: "Nearby landmark", icon: Landmark, placeholder: "Next to City Bank ATM", optional: true },
  ],
};

const EMPTY = {
  label: "Home",
  name: "",
  phone: "",
  house: "",
  area: "",
  company: "",
  placeName: "",
  landmark: "",
  deliveryTime: "",
  city: "",
  zipCode: "",
  isDefault: false,
};

// One-line street for checkout/couriers, plus a delivery note from the extra details
const composeAddress = (f) => {
  const parts = f.label === "Office" ? [f.company, f.house, f.area] : f.label === "Home" ? [f.house, f.area] : [f.area];
  const note = [f.landmark && `Landmark: ${f.landmark}`, f.deliveryTime && f.deliveryTime !== "Any time" && `Deliver ${f.deliveryTime}`]
    .filter(Boolean)
    .join(" · ");
  return { street: parts.map((p) => p.trim()).filter(Boolean).join(", "), note };
};

const titleOf = (a) => (a.label === "Other" && a.placeName) || (a.label === "Office" && a.company) || a.label;

// Home / Office / Other switcher with a sliding pill
function TypeTabs({ value, onChange }) {
  const [width, setWidth] = useState(0);
  const index = Math.max(0, LABELS.findIndex((l) => l.id === value));
  const tabWidth = width ? (width - 8) / LABELS.length : 0;
  const active = labelStyle(value);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(index * tabWidth, { damping: 18, stiffness: 180 }) }],
  }));

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[tw("flex-row rounded-2xl"), { padding: 4, backgroundColor: colors.gray50, borderWidth: 1, borderColor: colors.gray100 }]}
    >
      {tabWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            { position: "absolute", top: 4, left: 4, bottom: 4, width: tabWidth, borderRadius: 12, backgroundColor: "#fff" },
            { shadowColor: active.color, shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
            pillStyle,
          ]}
        />
      )}
      {LABELS.map(({ id, icon: Icon, color }) => {
        const on = value === id;
        return (
          <Pressable key={id} onPress={() => onChange(id)} style={tw("flex-1 flex-row items-center justify-center gap-1.5 py-2.5 cursor-pointer")}>
            <Icon size={15} color={on ? color : colors.gray400} strokeWidth={on ? 2.5 : 2} />
            <Text style={[tw("text-xs font-extrabold"), { color: on ? color : colors.gray500 }]}>{id}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Mounted only while open, so each open starts from `initial`
function AddressSheet({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    const start = { ...EMPTY, ...initial };
    // addresses saved from checkout only have a one-line street
    if (!start.area && !start.house && start.street) start.area = start.street;
    return start;
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (value) => {
    setError("");
    setForm((f) => ({ ...f, [key]: value }));
  };
  const fields = FIELDS[form.label] || FIELDS.Home;
  const type = labelStyle(form.label);

  const save = async () => {
    for (const f of fields) {
      if (f.phone && !BD_PHONE.test(form.phone.replace(/[\s-]/g, ""))) return setError("Enter a valid mobile number (01XXXXXXXXX)");
      if (f.required && !String(form[f.key] || "").trim()) return setError(f.required);
    }
    if (!form.city.trim()) return setError("Enter the city");

    setSaving(true);
    const { street, note } = composeAddress(form);
    const trimmed = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));
    await addressBook.save({ ...trimmed, phone: form.phone.replace(/[\s-]/g, ""), street, note });
    setSaving(false);
    onSaved();
  };

  const renderField = (f) => {
    if (f.row) {
      return (
        <View key="city-row" style={tw("flex-row gap-3")}>
          <FormField style={tw("flex-1")} label="City / district" value={form.city} onChangeText={set("city")} placeholder="Dhaka" />
          <FormField style={{ width: 120 }} label="Post code" optional value={form.zipCode} onChangeText={set("zipCode")} placeholder="1209" keyboardType="number-pad" />
        </View>
      );
    }
    if (f.chips) {
      return (
        <View key={f.key}>
          <View style={tw("flex-row items-center gap-1.5 mb-1.5")}>
            <Clock size={12} color={colors.gray500} />
            <Text style={[tw("font-bold text-gray-700"), { fontSize: 11 }]}>{f.label}</Text>
          </View>
          <View style={tw("flex-row flex-wrap gap-1.5")}>
            {f.chips.map((c) => {
              const on = form[f.key] === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => set(f.key)(on ? "" : c)}
                  style={[
                    tw("px-3 py-2 rounded-full cursor-pointer"),
                    { borderWidth: 1.5, borderColor: on ? type.color : colors.gray100, backgroundColor: on ? type.bg : "#fff" },
                  ]}
                >
                  <Text style={[tw("text-xs font-bold"), { color: on ? type.color : colors.gray600 }]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }
    return (
      <FormField
        key={f.key}
        label={f.label}
        icon={f.icon}
        optional={f.optional}
        value={form[f.key]}
        onChangeText={set(f.key)}
        placeholder={f.placeholder}
        keyboardType={f.keyboardType}
      />
    );
  };

  return (
    <Modal visible animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={tw("flex-1 justify-end items-center")} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <BlurBackdrop onPress={onClose} />
        <Animated.View
          entering={SlideInDown.springify().damping(18).stiffness(160)}
          style={[tw("w-full glass-strong rounded-t-3xl pt-3 px-5"), { maxWidth: 480, maxHeight: "92%" }]}
        >
          <View style={tw("w-12 h-1.5 rounded-full bg-gray-300 self-center mb-3")} />
          <View style={tw("flex-row items-center justify-between mb-3")}>
            <Text style={tw("text-base font-extrabold text-gray-900")}>{form.id ? "Edit address" : "New address"}</Text>
            <Pressable onPress={onClose} style={tw("w-8 h-8 rounded-full bg-gray-100 items-center justify-center cursor-pointer")}>
              <X size={16} color={colors.gray600} />
            </Pressable>
          </View>

          <TypeTabs value={form.label} onChange={set("label")} />

          <ScrollView contentContainerStyle={tw("gap-3 pt-3 pb-8")} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Animated.View key={`hint-${form.label}`} entering={FadeIn.duration(220)} style={[tw("flex-row items-center gap-2 p-2.5 rounded-xl"), { backgroundColor: type.bg }]}>
              <type.icon size={14} color={type.color} />
              <Text style={[tw("flex-1 font-semibold"), { fontSize: 11, color: type.color }]}>{type.hint}</Text>
            </Animated.View>

            {/* Fields change per type; re-keyed so they fade in on switch */}
            <Animated.View key={`fields-${form.label}`} entering={FadeInDown.duration(260)} layout={LinearTransition} style={tw("gap-3")}>
              {fields.map(renderField)}
            </Animated.View>

            <Pressable onPress={() => set("isDefault")(!form.isDefault)} style={tw("flex-row items-center gap-2.5 py-1 cursor-pointer")}>
              <View
                style={[
                  tw("w-5 h-5 rounded-md items-center justify-center"),
                  form.isDefault ? { backgroundColor: colors.brand } : { borderWidth: 1.5, borderColor: colors.gray300 },
                ]}
              >
                {form.isDefault && <Check size={13} color="#fff" strokeWidth={3} />}
              </View>
              <Text style={tw("text-xs font-semibold text-gray-700")}>Use as my default delivery address</Text>
            </Pressable>

            {!!error && (
              <Animated.Text entering={FadeIn} style={[tw("text-xs font-bold"), { color: colors.red500 }]}>
                {error}
              </Animated.Text>
            )}

            <Pressable
              onPress={save}
              disabled={saving}
              style={({ pressed }) => [
                tw("flex-row items-center justify-center gap-2 rounded-2xl cursor-pointer"),
                { height: 50, backgroundColor: colors.brand },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Check size={17} color="#fff" strokeWidth={3} />}
              <Text style={tw("text-white text-sm font-extrabold")}>Save {form.label.toLowerCase()} address</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AddressCard({ address: a, index, onEdit, onDelete, onDefault }) {
  const ls = labelStyle(a.label);
  const Icon = ls.icon;
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify().damping(16)}
      exiting={FadeOut.duration(180)}
      layout={LinearTransition.springify().damping(16)}
      style={[
        tw("glass rounded-2xl overflow-hidden"),
        { borderWidth: 1.5, borderColor: a.isDefault ? colors.brand : colors.gray100 },
      ]}
    >
      {/* Coloured top strip per type */}
      <View style={{ height: 4, backgroundColor: ls.color, opacity: 0.85 }} />
      <View style={tw("p-4")}>
        <View style={tw("flex-row items-start gap-3")}>
          <View style={[tw("w-11 h-11 rounded-2xl items-center justify-center"), { backgroundColor: ls.bg }]}>
            <Icon size={19} color={ls.color} />
          </View>
          <View style={tw("flex-1")}>
            <View style={tw("flex-row items-center gap-2 flex-wrap")}>
              <Text numberOfLines={1} style={[tw("text-sm font-extrabold text-gray-900"), { flexShrink: 1 }]}>
                {titleOf(a)}
              </Text>
              <View style={[tw("px-1.5 rounded-md"), { backgroundColor: ls.bg, paddingVertical: 1 }]}>
                <Text style={[tw("font-black"), { fontSize: 9, color: ls.color, letterSpacing: 0.5 }]}>{a.label.toUpperCase()}</Text>
              </View>
              {a.isDefault && (
                <View style={[tw("flex-row items-center gap-0.5 px-1.5 rounded-md"), { backgroundColor: colors.brandLight, paddingVertical: 1 }]}>
                  <Star size={8} color={colors.brandDark} fill={colors.brandDark} />
                  <Text style={[tw("font-black text-brand-dark"), { fontSize: 9, letterSpacing: 0.5 }]}>DEFAULT</Text>
                </View>
              )}
            </View>
            <View style={tw("flex-row items-center gap-1.5 mt-1.5")}>
              <User size={12} color={colors.gray400} />
              <Text style={tw("text-xs font-bold text-gray-800")}>{a.name}</Text>
              <Text style={tw("text-xs text-gray-300")}>•</Text>
              <Text style={tw("text-xs font-semibold text-gray-600")}>{a.phone}</Text>
            </View>
            <View style={tw("flex-row items-start gap-1.5 mt-1")}>
              <MapPin size={12} color={colors.gray400} style={{ marginTop: 2 }} />
              <Text style={[tw("flex-1 text-gray-500 font-medium"), { fontSize: 12, lineHeight: 17 }]}>
                {[a.street, a.city, a.zipCode].filter(Boolean).join(", ")}
              </Text>
            </View>
            {!!a.note && (
              <View style={tw("flex-row items-start gap-1.5 mt-1")}>
                {a.label === "Office" ? <Clock size={12} color={ls.color} style={{ marginTop: 2 }} /> : <Landmark size={12} color={ls.color} style={{ marginTop: 2 }} />}
                <Text style={[tw("flex-1 font-semibold"), { fontSize: 11, color: ls.color }]}>{a.note}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[tw("flex-row gap-2 mt-3 pt-3"), { borderTopWidth: 1, borderTopColor: colors.gray50 }]}>
          {!a.isDefault && (
            <Pressable onPress={onDefault} style={[tw("flex-row items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer"), { backgroundColor: colors.brandLight }]}>
              <Star size={12} color={colors.brandDark} />
              <Text style={tw("text-xs font-bold text-brand-dark")}>Set default</Text>
            </Pressable>
          )}
          <View style={tw("flex-1")} />
          <Pressable onPress={onEdit} style={tw("flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-gray-50 cursor-pointer")}>
            <Pencil size={12} color={colors.gray700} />
            <Text style={tw("text-xs font-bold text-gray-700")}>Edit</Text>
          </Pressable>
          <Pressable onPress={onDelete} style={[tw("flex-row items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer"), { backgroundColor: "#fef2f2" }]}>
            <Trash2 size={12} color={colors.red500} />
            <Text style={[tw("text-xs font-bold"), { color: colors.red500 }]}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

export default function AddressesScreen() {
  const router = useRouter();
  const user = useSelector((s) => s.auth?.user);
  const [addresses, setAddresses] = useState(null);
  const [editing, setEditing] = useState(null);

  const reload = useCallback(() => addressBook.list().then(setAddresses), []);
  useEffect(() => {
    reload();
  }, [reload]);

  const openNew = (label = "Home") => setEditing({ label, name: user?.name || "", phone: user?.phone || "", isDefault: !addresses?.length });
  const count = addresses?.length || 0;

  return (
    <SafeAreaView style={tw("flex-1 bg-canvas")}>
      <AppBackground />
      <ScreenHeader
        id="addresses-hero"
        title="Saved addresses"
        subtitle={count ? `${count} ${count === 1 ? "place" : "places"} · pick one at checkout in a tap` : "Home, office & other places you ship to"}
        actionLabel="Add new"
        actionIcon={Plus}
        onAction={() => openNew()}
        onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      >
        {/* Quick add per type */}
        <View style={tw("flex-row gap-2 mt-4")}>
          {LABELS.map(({ id, icon: Icon }) => (
            <Pressable
              key={id}
              onPress={() => openNew(id)}
              style={({ pressed }) => [
                tw("flex-1 flex-row items-center justify-center gap-1.5 rounded-xl cursor-pointer"),
                { height: 40, backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)" },
                pressed && { backgroundColor: "rgba(255,255,255,0.26)" },
              ]}
            >
              <Icon size={14} color="#fff" />
              <Text style={tw("text-white text-xs font-bold")}>+ {id}</Text>
            </Pressable>
          ))}
        </View>
      </ScreenHeader>

      {addresses === null ? (
        <ActivityIndicator color={colors.brand} style={tw("mt-16")} />
      ) : count === 0 ? (
        <Animated.View entering={FadeInDown.springify().damping(16)} style={tw("flex-1 items-center justify-center px-8")}>
          <View style={[tw("w-20 h-20 rounded-full items-center justify-center"), { backgroundColor: colors.brandLight }]}>
            <MapPin size={34} color={colors.brandDark} />
          </View>
          <Text style={tw("text-base font-extrabold text-gray-900 mt-4")}>No saved addresses yet</Text>
          <Text style={tw("text-xs text-gray-500 font-medium text-center mt-1")}>
            Add your home or office so checkout is faster. Addresses you use at checkout are saved here automatically.
          </Text>
        </Animated.View>
      ) : (
        <ScrollView contentContainerStyle={tw("p-4 gap-3 pb-10")} showsVerticalScrollIndicator={false}>
          {addresses.map((a, idx) => (
            <AddressCard
              key={a.id}
              address={a}
              index={idx}
              onEdit={() => setEditing(a)}
              onDelete={() => addressBook.remove(a.id).then(setAddresses)}
              onDefault={() => addressBook.setDefault(a.id).then(setAddresses)}
            />
          ))}
        </ScrollView>
      )}

      {editing && (
        <AddressSheet
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </SafeAreaView>
  );
}
