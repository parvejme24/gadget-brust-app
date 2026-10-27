import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Briefcase, Megaphone, ScanBarcode, ShieldCheck, User, Warehouse, Zap } from "lucide-react-native";
import { demoAccounts } from "@/data/demoAccounts";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const ROLE_STYLE = {
  admin: { icon: ShieldCheck, color: "#047857", bg: "#d1fae5" },
  manager: { icon: Briefcase, color: "#1d4ed8", bg: "#dbeafe" },
  cashier: { icon: ScanBarcode, color: "#b45309", bg: "#fef3c7" },
  inventory: { icon: Warehouse, color: "#6d28d9", bg: "#ede9fe" },
  marketing: { icon: Megaphone, color: "#be185d", bg: "#fce7f3" },
  user: { icon: User, color: "#0e7490", bg: "#cffafe" },
};

/**
 * "Quick demo access" grid, mirroring the website login page:
 * tapping a role signs in with that seeded account. First and last buttons span the full width.
 */
export default function DemoLogin({ onLogin, loadingRole, disabled }) {
  return (
    <View style={tw("mt-5")}>
      <View style={tw("flex-row items-center gap-3 mb-3")}>
        <View style={[tw("flex-1"), { height: 1, backgroundColor: colors.gray200 }]} />
        <View style={tw("flex-row items-center gap-1")}>
          <Zap size={11} color={colors.gray400} />
          <Text style={[tw("font-bold text-gray-400"), { fontSize: 10, letterSpacing: 1 }]}>QUICK DEMO ACCESS</Text>
        </View>
        <View style={[tw("flex-1"), { height: 1, backgroundColor: colors.gray200 }]} />
      </View>

      <View style={tw("flex-row flex-wrap justify-between")}>
        {demoAccounts.map((account, index) => {
          const style = ROLE_STYLE[account.role] || ROLE_STYLE.user;
          const Icon = style.icon;
          const wide = index === 0 || index === demoAccounts.length - 1;
          const loading = loadingRole === account.role;
          return (
            <Animated.View
              key={account.role}
              entering={FadeInDown.delay(80 + index * 50).springify().damping(16)}
              style={{ width: wide ? "100%" : "48.5%", marginBottom: 8 }}
            >
              <Pressable
                onPress={() => onLogin(account)}
                disabled={disabled}
                accessibilityLabel={`Sign in as demo ${account.label}`}
                style={({ pressed }) => [
                  tw("flex-row items-center gap-2.5 px-3 rounded-2xl cursor-pointer"),
                  {
                    height: 50,
                    backgroundColor: loading ? style.bg : "#ffffff",
                    borderWidth: 1.5,
                    borderColor: loading ? style.color : colors.gray100,
                    opacity: disabled && !loading ? 0.55 : 1,
                  },
                  pressed && { transform: [{ scale: 0.97 }], borderColor: style.color },
                ]}
              >
                <View style={[tw("w-8 h-8 rounded-xl items-center justify-center"), { backgroundColor: style.bg }]}>
                  {loading ? <ActivityIndicator size="small" color={style.color} /> : <Icon size={16} color={style.color} strokeWidth={2.3} />}
                </View>
                <View style={tw("flex-1")}>
                  <Text numberOfLines={1} style={tw("text-xs font-extrabold text-gray-900")}>
                    {account.label}
                  </Text>
                  <Text numberOfLines={1} style={[tw("text-gray-500 font-medium"), { fontSize: 10 }]}>
                    {wide ? `${account.description} · ${account.email}` : account.description}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <Text style={[tw("text-center text-gray-400 font-medium mt-1"), { fontSize: 11 }]}>
        Same demo accounts as the website. Staff dashboards open on the web.
      </Text>
    </View>
  );
}
