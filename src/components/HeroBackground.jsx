import React from "react";
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { colors } from "@/theme";

// Brand green gradient with soft decorative circles, drawn behind screen heroes
export default function HeroBackground({ id = "hero", width, height }) {
  if (!width || !height) return null;
  const gradId = `${id}-grad`;
  return (
    <Svg width={width} height={height} pointerEvents="none" style={{ position: "absolute", top: 0, left: 0 }}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#0f3d2e" />
          <Stop offset="0.55" stopColor="#1f6f52" />
          <Stop offset="1" stopColor={colors.brand} />
        </LinearGradient>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${gradId})`} />
      <Circle cx={width * 0.92} cy={height * 0.12} r={height * 0.55} fill="#ffffff" fillOpacity={0.06} />
      <Circle cx={width * 0.78} cy={height * 0.95} r={height * 0.35} fill="#ffffff" fillOpacity={0.05} />
      <Circle cx={width * 0.05} cy={height * 0.2} r={height * 0.22} fill="#ff6e06" fillOpacity={0.12} />
    </Svg>
  );
}
