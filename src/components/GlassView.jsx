import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { colors } from "@/theme";

const isWeb = Platform.OS === "web";

/**
 * Frosted-glass container with a real blur of what's behind it.
 * Use it for things that float over content (nav bar, search bars, sheets, sticky bars);
 * plain cards in long lists use the cheaper tw("glass") surface instead.
 * `tone`: "light" (white frost) or "dark" (smoked green frost); `tint` overrides the frost colour.
 */
export default function GlassView({ tone = "light", intensity = 40, tint: tintOverride, style, children, ...rest }) {
  const dark = tone === "dark";
  const tint = tintOverride || (dark ? "rgba(15,61,46,0.72)" : colors.glassStrong);
  const flat = StyleSheet.flatten(style) || {};
  const radius = {
    borderRadius: flat.borderRadius,
    borderTopLeftRadius: flat.borderTopLeftRadius,
    borderTopRightRadius: flat.borderTopRightRadius,
    borderBottomLeftRadius: flat.borderBottomLeftRadius,
    borderBottomRightRadius: flat.borderBottomRightRadius,
  };

  return (
    <View
      {...rest}
      style={[
        { borderWidth: 1, borderColor: dark ? "rgba(255,255,255,0.14)" : colors.glassBorder },
        isWeb && { backgroundColor: tint, backdropFilter: "blur(18px) saturate(170%)", WebkitBackdropFilter: "blur(18px) saturate(170%)" },
        style,
      ]}
    >
      {!isWeb && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, radius, { overflow: "hidden" }]}>
          <BlurView style={StyleSheet.absoluteFill} intensity={intensity} tint={dark ? "dark" : "light"} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
        </View>
      )}
      {children}
    </View>
  );
}
