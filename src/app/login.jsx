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
import { CheckCircle2, Eye, EyeOff, Lock, Mail, X } from "lucide-react-native";
import GadgetLogo from "@/components/GadgetLogo";
import { authService } from "@/services/authService";
import tw from "@/lib/tw";
import { colors } from "@/theme";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter your email and password.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);

    const res = await authService.login({ email, password });
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg("Signed in successfully! Redirecting...");
      setTimeout(() => {
        router.replace("/");
      }, 1000);
    } else {
      setErrorMsg(res.error || "Invalid credentials.");
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
          tw("w-full glass-strong rounded-t-3xl pt-3 pb-8 px-6 border-t border-gray-100 shadow-2xl max-h-5/6"),
          { maxWidth: 480 },
        ]}
      >
        {/* Drag Pill */}
        <View style={tw("w-12 h-1.5 rounded-full bg-gray-300 self-center mb-3")} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={tw("flex-row justify-between items-center mb-5")}>
            <View style={tw("flex-row items-center gap-2.5")}>
              <GadgetLogo width={105} height={38} />
              <View style={tw("border-l border-gray-200 pl-2.5")}>
                <Text style={tw("text-sm font-extrabold text-gray-900")}>Sign In</Text>
                <Text style={tw("text-[11px] text-gray-400 font-medium")}>Welcome back</Text>
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
          <View style={tw("gap-4")}>
            <View>
              <Text style={tw("text-sm font-semibold text-gray-800 mb-2")}>Email Address</Text>
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
              <View style={tw("flex-row justify-between items-center mb-2")}>
                <Text style={tw("text-sm font-semibold text-gray-800")}>Password</Text>
                <Text style={tw("text-xs text-brand font-bold cursor-pointer")}>
                  Forgot Password?
                </Text>
              </View>
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

            <Pressable
              onPress={handleLogin}
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
                <Text style={tw("text-white text-base font-bold")}>Sign In</Text>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View style={tw("mt-5 flex-row items-center justify-center gap-1.5 pb-4")}>
            <Text style={tw("text-xs text-gray-500")}>Don&apos;t have an account?</Text>
            <Link href="/register" asChild>
              <Pressable>
                <Text style={tw("text-xs text-brand font-bold cursor-pointer")}>Create Account</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
