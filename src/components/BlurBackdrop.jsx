import React, { createContext, useContext } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";

const isWeb = Platform.OS === "web";

// Holds the ref of the <BlurTargetView> wrapping the screen. Android only blurs real content
// through that target; without it the backdrop falls back to a dim tint.
export const BlurTargetContext = createContext(null);

// Soft frosted backdrop shared by every bottom drawer; tap to close
export default function BlurBackdrop({ onPress, blurTarget, intensity = 18 }) {
  const contextTarget = useContext(BlurTargetContext);
  const target = blurTarget || contextTarget;

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={onPress} accessibilityLabel="Close">
      {isWeb ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(15, 23, 20, 0.22)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" },
          ]}
        />
      ) : (
        <BlurView
          style={StyleSheet.absoluteFill}
          intensity={intensity}
          tint="dark"
          blurTarget={target}
          blurMethod={target ? "dimezisBlurViewSdk31Plus" : "none"}
        />
      )}
      {!isWeb && <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(15, 23, 20, 0.1)" }]} />}
    </Pressable>
  );
}
