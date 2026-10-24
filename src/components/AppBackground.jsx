import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, Ellipse, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";
import { colors } from "@/theme";

// Soft ambient colour field behind the whole app; glass surfaces pick these tints up
const BLOBS = [
  { cx: 0.1, cy: 0.06, rx: 0.75, ry: 0.32, color: "#5dd3a6", opacity: 0.55 },
  { cx: 0.95, cy: 0.3, rx: 0.65, ry: 0.28, color: "#7aa8ff", opacity: 0.4 },
  { cx: 0.05, cy: 0.62, rx: 0.6, ry: 0.26, color: "#ffb46b", opacity: 0.35 },
  { cx: 0.9, cy: 0.9, rx: 0.7, ry: 0.3, color: "#b49cff", opacity: 0.38 },
];

export default function AppBackground() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { width: w, height: h } = size;

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.canvas }]}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {w > 0 && (
        <Svg width={w} height={h}>
          <Defs>
            <LinearGradient id="bg-base" x1="0" y1="0" x2="0.4" y2="1">
              <Stop offset="0" stopColor="#eef8f3" />
              <Stop offset="0.5" stopColor="#f2f4f8" />
              <Stop offset="1" stopColor="#f6f1f8" />
            </LinearGradient>
            {BLOBS.map((b, i) => (
              <RadialGradient key={i} id={`blob-${i}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={b.color} stopOpacity={b.opacity} />
                <Stop offset="1" stopColor={b.color} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          <Rect width={w} height={h} fill="url(#bg-base)" />
          {BLOBS.map((b, i) => (
            <Ellipse key={i} cx={b.cx * w} cy={b.cy * h} rx={b.rx * w} ry={b.ry * h} fill={`url(#blob-${i})`} />
          ))}
        </Svg>
      )}
    </View>
  );
}
