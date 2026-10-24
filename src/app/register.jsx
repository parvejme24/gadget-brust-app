import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { CheckCircle2, Eye, EyeOff, Lock, Mail, Phone, User, X } from "lucide-react-native";
import GadgetLogo from "@/components/GadgetLogo";
import { authService } from "@/services/authService";
import tw from "@/lib/tw";
import { colors } from "@/theme";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);

    const res = await authService.register({ name, email, password, phone });
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg("Account created successfully! Welcome to Gadget Brust.");
      setTimeout(() => {
        router.replace("/");
      }, 1200);
    } else {
      setErrorMsg(res.error || "Failed to create account.");
    }
  };

  return (
    <View style={tw("flex-1 justify-end items-center")}>
      {/* Top Dark Area Dismiss Tap with frosted glass blur */}
      <Pressable
        style={[
          tw("absolute inset-0"),
          {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            ...(Platform.OS === "web"
              ? {
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }
              : {}),
          },
        ]}
        onPress={() => router.back()}
      />

      {/* Bottom Drawer Sheet */}
      <View
        style={[
          tw("w-full bg-surface rounded-t-3xl pt-3 pb-8 px-6 border-t border-gray-100 shadow-2xl max-h-5/6"),
          { maxWidth: 480 },
        ]}
      >
        {/* Drag Pill */}
        <View style={tw("w-12 h-1.5 rounded-full bg-gray-300 self-center mb-3")} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={tw("flex-row justify-between items-center mb-4")}>
            <View style={tw("flex-row items-center gap-2.5")}>
              <GadgetLogo width={105} height={38} />
              <View style={tw("border-l border-gray-200 pl-2.5")}>
                <Text style={tw("text-sm font-extrabold text-gray-900")}>Create Account</Text>
                <Text style={tw("text-[11px] text-gray-400 font-medium")}>Join Gadget Brust</Text>
              </View>
            </View>

            <Pressable
              onPress={() => router.back()}
              style={tw("w-9 h-9 rounded-full bg-gray-100 items-center justify-center cursor-pointer")}
            >
              <X size={18} color={colors.gray600} />
            </Pressable>
          </View>

          {/* Error & Success */}
          {!!errorMsg && (
            <View style={tw("bg-red-50 p-3 rounded-xl border border-red-200 mb-3")}>
              <Text style={tw("text-xs text-red-600 font-semibold")}>{errorMsg}</Text>
            </View>
          )}
          {!!successMsg && (
            <View style={tw("bg-emerald-50 p-3 rounded-xl border border-emerald-200 mb-3 flex-row items-center gap-2")}>
              <CheckCircle2 size={16} color={colors.brand} />
              <Text style={tw("text-xs text-emerald-700 font-semibold")}>{successMsg}</Text>
            </View>
          )}

          {/* Form */}
          <View style={tw("gap-3.5")}>
            <View>
              <Text style={tw("text-sm font-semibold text-gray-800 mb-2")}>Full Name *</Text>
              <View style={[tw("flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 gap-3"), { height: 52 }]}>
                <User size={20} color={colors.gray400} />
                <TextInput
                  placeholder="John Doe"
                  placeholderTextColor={colors.gray400}
                  value={name}
                  onChangeText={setName}
                  style={[tw("flex-1 text-gray-900 font-medium outline-none"), { fontSize: 15, height: "100%", paddingVertical: 0, outlineStyle: "none" }]}
                />
              </View>
            </View>

            <View>
              <Text style={tw("text-sm font-semibold text-gray-800 mb-2")}>Email Address *</Text>
              <View style={[tw("flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 gap-3"), { height: 52 }]}>
                <Mail size={20} color={colors.gray400} />
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor={colors.gray400}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  style={[tw("flex-1 text-gray-900 font-medium outline-none"), { fontSize: 15, height: "100%", paddingVertical: 0, outlineStyle: "none" }]}
                />
              </View>
            </View>

            <View>
              <Text style={tw("text-sm font-semibold text-gray-800 mb-2")}>Phone Number</Text>
              <View style={[tw("flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 gap-3"), { height: 52 }]}>
                <Phone size={20} color={colors.gray400} />
                <TextInput
                  placeholder="+880 1711-223344"
                  placeholderTextColor={colors.gray400}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  style={[tw("flex-1 text-gray-900 font-medium outline-none"), { fontSize: 15, height: "100%", paddingVertical: 0, outlineStyle: "none" }]}
                />
              </View>
            </View>

            <View>
              <Text style={tw("text-sm font-semibold text-gray-800 mb-2")}>Password *</Text>
              <View style={[tw("flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 gap-3"), { height: 52 }]}>
                <Lock size={20} color={colors.gray400} />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={colors.gray400}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  style={[tw("flex-1 text-gray-900 font-medium outline-none"), { fontSize: 15, height: "100%", paddingVertical: 0, outlineStyle: "none" }]}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={tw("p-1.5 cursor-pointer")}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.gray500} />
                  ) : (
                    <Eye size={20} color={colors.gray500} />
                  )}
                </Pressable>
              </View>
            </View>

            <View>
              <Text style={tw("text-sm font-semibold text-gray-800 mb-2")}>Confirm Password *</Text>
              <View style={[tw("flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 gap-3"), { height: 52 }]}>
                <Lock size={20} color={colors.gray400} />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={colors.gray400}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={[tw("flex-1 text-gray-900 font-medium outline-none"), { fontSize: 15, height: "100%", paddingVertical: 0, outlineStyle: "none" }]}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={tw("p-1.5 cursor-pointer")}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.gray500} />
                  ) : (
                    <Eye size={20} color={colors.gray500} />
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              style={({ pressed }) => [
                tw("mt-3 bg-brand rounded-full items-center justify-center shadow-md cursor-pointer"),
                { height: 52 },
                pressed && { opacity: 0.9 },
                isLoading && { opacity: 0.6 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={tw("text-white text-base font-bold")}>Create Account</Text>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View style={tw("mt-5 flex-row items-center justify-center gap-1.5 pb-4")}>
            <Text style={tw("text-xs text-gray-500")}>Already have an account?</Text>
            <Link href="/login" asChild>
              <Pressable>
                <Text style={tw("text-xs text-brand font-bold cursor-pointer")}>Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
