import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import BlurBackdrop from "@/components/BlurBackdrop";
import DemoLogin from "@/components/DemoLogin";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react-native";
import { authService } from "@/services/authService";
import GadgetLogo from "./GadgetLogo";
import tw from "@/lib/tw";
import { colors } from "@/theme";

export default function AuthModal({ visible, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot' | 'reset'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [demoRole, setDemoRole] = useState(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setCode("");
    setDevCode("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    setMode(initialMode);
    onClose?.();
  };

  // One-tap sign in with a seeded demo account (same list as the website)
  const handleDemoLogin = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setErrorMsg("");
    setDemoRole(account.role);
    const res = await authService.login({ email: account.email, password: account.password });
    setDemoRole(null);
    if (res.success) {
      setSuccessMsg(`Signed in as demo ${account.label}! 🎉`);
      setTimeout(() => handleClose(), 1000);
    } else {
      setErrorMsg(res.error || "Demo sign in failed.");
    }
  };

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
      setSuccessMsg("Signed in successfully! 🎉");
      setTimeout(() => {
        handleClose();
      }, 1200);
    } else {
      setErrorMsg(res.error || "Invalid credentials.");
    }
  };

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
        handleClose();
      }, 1500);
    } else {
      setErrorMsg(res.error || "Failed to create account.");
    }
  };

  // step 1: email a 6-digit code
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    const res = await authService.forgotPassword(email);
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }
    setDevCode(res.devCode || "");
    setPassword("");
    setMode("reset");
    setSuccessMsg("If that email has an account, we've sent a 6-digit code.");
  };

  // step 2: code + new password; the server signs the user in
  const handleResetPassword = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      setErrorMsg("Enter the 6-digit code from the email.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Your new password needs at least 6 characters.");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);
    const res = await authService.resetPassword({ email, code, newPassword: password });
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg("Password changed. You're signed in! 🎉");
      setTimeout(() => handleClose(), 1200);
    } else {
      setErrorMsg(res.error);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={handleClose}>
      {/* Outer wrapper */}
      <View style={tw("flex-1 justify-end items-center")}>
        {/* Backdrop: soft blur over the screen behind; tap to close */}
        <BlurBackdrop onPress={handleClose} />

        {/* Bottom Drawer Screen (mobile width constrained) */}
        <Animated.View
          entering={SlideInDown.springify().damping(18).stiffness(160)}
          style={[
            tw("w-full glass-strong rounded-t-3xl pt-3 pb-8 px-6 border-t border-gray-100 shadow-2xl max-h-5/6"),
            { maxWidth: 480 },
          ]}
        >
          {/* Drawer Handle Pill */}
          <View style={tw("w-12 h-1.5 rounded-full bg-gray-300 self-center mb-3")} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={tw("flex-row justify-between items-center mb-4")}>
              <View>
                <GadgetLogo width={105} height={36} style={tw("mb-1.5")} />
                <Text style={tw("text-xl font-extrabold text-gray-900")}>
                  {mode === "login"
                    ? "Welcome Back 👋"
                    : mode === "register"
                    ? "Create Account ✨"
                    : mode === "reset"
                    ? "Set New Password 🔒"
                    : "Reset Password 🔑"}
                </Text>
                <Text style={tw("text-xs text-gray-500 mt-0.5")}>
                  {mode === "login"
                    ? "Sign in to access your orders and wishlist"
                    : mode === "register"
                    ? "Join Gadget Brust for authentic smart tech"
                    : mode === "reset"
                    ? `Enter the code we sent to ${email.trim()}`
                    : "We'll email you a 6-digit code"}
                </Text>
              </View>

              <Pressable
                onPress={handleClose}
                style={tw("w-9 h-9 rounded-full bg-gray-100 items-center justify-center cursor-pointer")}
              >
                <X size={18} color={colors.gray600} />
              </Pressable>
            </View>

            {/* Error & Success Alerts */}
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

            {/* REGISTER: Name input */}
            {mode === "register" && (
              <View style={tw("mb-3.5")}>
                <Text style={tw("text-sm font-semibold text-gray-800 mb-2")}>Full Name *</Text>
                <View style={[tw("flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 gap-3"), { height: 52 }]}>
                  <User size={20} color={colors.gray400} />
                  <TextInput
                    placeholder="Enter your name"
                    placeholderTextColor={colors.gray400}
                    value={name}
                    onChangeText={setName}
                    style={[tw("flex-1 text-gray-900 font-medium outline-none"), { fontSize: 15, height: "100%", paddingVertical: 0, outlineStyle: "none" }]}
                  />
                </View>
              </View>
            )}

            {/* Email input */}
            <View style={tw("mb-3.5")}>
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

            {/* RESET: code from the email */}
            {mode === "reset" && (
              <View style={tw("mb-3.5")}>
                {!!devCode && (
                  <View style={tw("bg-amber-50 p-3 rounded-xl border border-amber-200 mb-3")}>
                    <Text style={tw("text-xs text-amber-800 font-semibold")}>
                      Development server without email: your code is {devCode}
                    </Text>
                  </View>
                )}
                <Text style={tw("text-sm font-semibold text-gray-800 mb-2")}>Reset Code *</Text>
                <View style={[tw("flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 gap-3"), { height: 52 }]}>
                  <KeyRound size={20} color={colors.gray400} />
                  <TextInput
                    placeholder="123456"
                    placeholderTextColor={colors.gray400}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChangeText={(v) => setCode(v.replace(/\D/g, ""))}
                    style={[tw("flex-1 text-gray-900 font-medium outline-none"), { fontSize: 15, height: "100%", paddingVertical: 0, outlineStyle: "none", letterSpacing: 4 }]}
                  />
                </View>
                <Pressable onPress={handleForgotPassword} disabled={isLoading} style={tw("mt-2 self-end")}>
                  <Text style={tw("text-xs text-brand font-bold cursor-pointer")}>Send a new code</Text>
                </Pressable>
              </View>
            )}

            {/* REGISTER: Phone input */}
            {mode === "register" && (
              <View style={tw("mb-3.5")}>
                <Text style={tw("text-sm font-semibold text-gray-800 mb-2")}>Phone Number</Text>
                <View style={[tw("flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 gap-3"), { height: 52 }]}>
                  <Phone size={20} color={colors.gray400} />
                  <TextInput
                    placeholder="+880 1711-000000"
                    placeholderTextColor={colors.gray400}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    style={[tw("flex-1 text-gray-900 font-medium outline-none"), { fontSize: 15, height: "100%", paddingVertical: 0, outlineStyle: "none" }]}
                  />
                </View>
              </View>
            )}

            {/* Password input with show/hide toggle */}
            {mode !== "forgot" && (
              <View style={tw("mb-3.5")}>
                <View style={tw("flex-row justify-between items-center mb-2")}>
                  <Text style={tw("text-sm font-semibold text-gray-800")}>{mode === "reset" ? "New Password *" : "Password *"}</Text>
                  {mode === "login" && (
                    <Pressable onPress={() => { setMode("forgot"); setErrorMsg(""); }}>
                      <Text style={tw("text-xs text-brand font-bold cursor-pointer")}>
                        Forgot Password?
                      </Text>
                    </Pressable>
                  )}
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
            )}

            {/* REGISTER: Confirm Password with show/hide toggle */}
            {mode === "register" && (
              <View style={tw("mb-4")}>
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
            )}

            {/* Submit CTA Button */}
            <Pressable
              onPress={
                mode === "login"
                  ? handleLogin
                  : mode === "register"
                  ? handleRegister
                  : mode === "reset"
                  ? handleResetPassword
                  : handleForgotPassword
              }
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
                <Text style={tw("text-white text-base font-bold")}>
                  {mode === "login"
                    ? "Sign In"
                    : mode === "register"
                    ? "Create Account"
                    : mode === "reset"
                    ? "Set New Password"
                    : "Send Reset Code"}
                </Text>
              )}
            </Pressable>

            {mode === "login" && <DemoLogin onLogin={handleDemoLogin} loadingRole={demoRole} disabled={isLoading || !!demoRole} />}

            {/* Switch Mode Footer */}
            <View style={tw("mt-4 flex-row items-center justify-center gap-1.5 pb-4")}>
              {mode === "login" ? (
                <>
                  <Text style={tw("text-xs text-gray-500")}>Don&apos;t have an account?</Text>
                  <Pressable onPress={() => { setMode("register"); setErrorMsg(""); }}>
                    <Text style={tw("text-xs text-brand font-bold cursor-pointer")}>Sign Up</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={tw("text-xs text-gray-500")}>Already have an account?</Text>
                  <Pressable onPress={() => { setMode("login"); setErrorMsg(""); }}>
                    <Text style={tw("text-xs text-brand font-bold cursor-pointer")}>Sign In</Text>
                  </Pressable>
                </>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
