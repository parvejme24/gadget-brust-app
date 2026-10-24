import { Platform } from "react-native";
import { colors, font } from "@/theme";

const isWeb = Platform.OS === "web";

/**
 * Lightweight Zero-Dependency Tailwind Utility Engine
 * Maps standard Tailwind utility class names to React Native style objects.
 * Supports conditional syntax: tw("p-4 bg-white", isActive && "bg-brand text-white")
 */

const CLASS_CACHE = new Map();

const COLOR_MAP = {
  brand: colors.brand,
  "brand-dark": colors.brandDark,
  "brand-light": colors.brandLight,
  // screens are see-through so the app-wide ambient background shows behind glass cards
  canvas: "transparent",
  surface: colors.glass,
  glass: colors.glass,
  "glass-strong": colors.glassStrong,
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
  "gray-50": colors.gray50,
  "gray-100": colors.gray100,
  "gray-200": colors.gray200,
  "gray-300": colors.gray300,
  "gray-400": colors.gray400,
  "gray-500": colors.gray500,
  "gray-600": colors.gray600,
  "gray-700": colors.gray700,
  "gray-800": "#1f2937",
  "gray-900": colors.gray900,
  "red-50": "#fef2f2",
  "red-100": "#fee2e2",
  "red-200": "#fecaca",
  "red-500": colors.red500,
  "red-600": "#dc2626",
  "emerald-50": "#ecfdf5",
  "emerald-100": "#d1fae5",
  "emerald-200": "#a7f3d0",
  "emerald-500": "#10b981",
  "emerald-600": "#059669",
  "emerald-700": "#047857",
  "emerald-800": "#065f46",
  "amber-50": "#fffbeb",
  "amber-100": "#fef3c7",
  "amber-200": "#fde68a",
  "amber-500": colors.amber500,
  "amber-600": "#d97706",
  "amber-700": "#b45309",
  "amber-800": "#92400e",
  "blue-50": "#eff6ff",
  "blue-100": "#dbeafe",
  "blue-200": "#bfdbfe",
  "blue-500": "#3b82f6",
  "blue-600": "#2563eb",
  "blue-700": "#1d4ed8",
  "purple-50": "#faf5ff",
  "purple-100": "#f3e8ff",
  "purple-200": "#e9d5ff",
  "purple-500": "#a855f7",
  "purple-600": "#9333ea",
  "purple-700": "#7c3aed",
};

const SPACING_MAP = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  4.5: 18,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  18: 72,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  64: 256,
};

const RADIUS_MAP = {
  none: 0,
  sm: 6,
  DEFAULT: 8,
  md: 10,
  lg: 14,
  xl: 18,
  "2xl": 22,
  "3xl": 28,
  full: 9999,
};

const FONT_MAP = {
  xs: font.xs, // 12
  sm: font.sm, // 14
  base: font.md, // 16
  lg: font.lg, // 18
  xl: font.xl, // 22
  "2xl": font.xxl, // 28
  "3xl": 32,
  "4xl": 38,
};

function parseSingleClass(cls) {
  if (CLASS_CACHE.has(cls)) return CLASS_CACHE.get(cls);

  const style = {};

  // Aspect ratio
  if (cls === "aspect-square") {
    style.aspectRatio = 1;
  } else if (cls === "aspect-video") {
    style.aspectRatio = 16 / 9;
  }

  // Flexbox
  else if (cls === "flex-1") style.flex = 1;
  else if (cls === "flex-row") style.flexDirection = "row";
  else if (cls === "flex-col") style.flexDirection = "column";
  else if (cls === "flex-wrap") style.flexWrap = "wrap";
  else if (cls === "items-center") style.alignItems = "center";
  else if (cls === "items-start") style.alignItems = "flex-start";
  else if (cls === "items-end") style.alignItems = "flex-end";
  else if (cls === "items-stretch") style.alignItems = "stretch";
  else if (cls === "justify-center") style.justifyContent = "center";
  else if (cls === "justify-between") style.justifyContent = "space-between";
  else if (cls === "justify-start") style.justifyContent = "flex-start";
  else if (cls === "justify-end") style.justifyContent = "flex-end";
  else if (cls === "justify-around") style.justifyContent = "space-around";
  else if (cls === "self-center") style.alignSelf = "center";
  else if (cls === "self-start") style.alignSelf = "flex-start";
  else if (cls === "self-end") style.alignSelf = "flex-end";
  else if (cls === "self-stretch") style.alignSelf = "stretch";

  // Gap
  else if (cls.startsWith("gap-")) {
    const val = SPACING_MAP[cls.replace("gap-", "")] ?? parseInt(cls.replace("gap-", ""), 10);
    if (!isNaN(val)) style.gap = val;
  }

  // Padding
  else if (cls.startsWith("p-")) {
    const val = SPACING_MAP[cls.replace("p-", "")];
    if (val !== undefined) style.padding = val;
  } else if (cls.startsWith("px-")) {
    const val = SPACING_MAP[cls.replace("px-", "")];
    if (val !== undefined) style.paddingHorizontal = val;
  } else if (cls.startsWith("py-")) {
    const val = SPACING_MAP[cls.replace("py-", "")];
    if (val !== undefined) style.paddingVertical = val;
  } else if (cls.startsWith("pt-")) {
    const val = SPACING_MAP[cls.replace("pt-", "")];
    if (val !== undefined) style.paddingTop = val;
  } else if (cls.startsWith("pb-")) {
    const val = SPACING_MAP[cls.replace("pb-", "")];
    if (val !== undefined) style.paddingBottom = val;
  } else if (cls.startsWith("pl-")) {
    const val = SPACING_MAP[cls.replace("pl-", "")];
    if (val !== undefined) style.paddingLeft = val;
  } else if (cls.startsWith("pr-")) {
    const val = SPACING_MAP[cls.replace("pr-", "")];
    if (val !== undefined) style.paddingRight = val;
  }

  // Margin
  else if (cls.startsWith("m-")) {
    const val = SPACING_MAP[cls.replace("m-", "")];
    if (val !== undefined) style.margin = val;
  } else if (cls.startsWith("mx-")) {
    if (cls === "mx-auto") {
      style.marginHorizontal = "auto";
    } else {
      const val = SPACING_MAP[cls.replace("mx-", "")];
      if (val !== undefined) style.marginHorizontal = val;
    }
  } else if (cls.startsWith("my-")) {
    const val = SPACING_MAP[cls.replace("my-", "")];
    if (val !== undefined) style.marginVertical = val;
  } else if (cls.startsWith("mt-")) {
    const val = SPACING_MAP[cls.replace("mt-", "")];
    if (val !== undefined) style.marginTop = val;
  } else if (cls.startsWith("mb-")) {
    const val = SPACING_MAP[cls.replace("mb-", "")];
    if (val !== undefined) style.marginBottom = val;
  } else if (cls.startsWith("ml-")) {
    const val = SPACING_MAP[cls.replace("ml-", "")];
    if (val !== undefined) style.marginLeft = val;
  } else if (cls.startsWith("mr-")) {
    const val = SPACING_MAP[cls.replace("mr-", "")];
    if (val !== undefined) style.marginRight = val;
  }

  // Sizing
  else if (cls === "w-full") style.width = "100%";
  else if (cls === "h-full") style.height = "100%";
  else if (cls === "w-screen") style.width = "100vw";
  else if (cls === "h-screen") style.height = "100vh";
  else if (cls === "min-h-screen") style.minHeight = "100vh";
  else if (cls.startsWith("w-")) {
    const key = cls.replace("w-", "");
    if (SPACING_MAP[key] !== undefined) style.width = SPACING_MAP[key];
    else if (!isNaN(key)) style.width = parseInt(key, 10);
  } else if (cls.startsWith("h-")) {
    const key = cls.replace("h-", "");
    if (SPACING_MAP[key] !== undefined) style.height = SPACING_MAP[key];
    else if (!isNaN(key)) style.height = parseInt(key, 10);
  } else if (cls.startsWith("min-h-")) {
    const key = cls.replace("min-h-", "");
    if (SPACING_MAP[key] !== undefined) style.minHeight = SPACING_MAP[key];
    else if (!isNaN(key)) style.minHeight = parseInt(key, 10);
  } else if (cls.startsWith("min-w-")) {
    const key = cls.replace("min-w-", "");
    if (SPACING_MAP[key] !== undefined) style.minWidth = SPACING_MAP[key];
    else if (!isNaN(key)) style.minWidth = parseInt(key, 10);
  } else if (cls.startsWith("max-w-")) {
    const key = cls.replace("max-w-", "");
    if (key === "xs") style.maxWidth = 320;
    else if (key === "sm") style.maxWidth = 384;
    else if (key === "md") style.maxWidth = 480;
    else if (key === "lg") style.maxWidth = 600;
    else if (key === "full") style.maxWidth = "100%";
  }

  // Background Color
  else if (cls.startsWith("bg-")) {
    const colorKey = cls.replace("bg-", "");
    if (COLOR_MAP[colorKey]) style.backgroundColor = COLOR_MAP[colorKey];
  }

  // Text Color & Alignment
  else if (cls.startsWith("text-")) {
    const colorKey = cls.replace("text-", "");
    if (COLOR_MAP[colorKey]) {
      style.color = COLOR_MAP[colorKey];
    } else if (FONT_MAP[colorKey]) {
      style.fontSize = FONT_MAP[colorKey];
    } else if (colorKey === "center") {
      style.textAlign = "center";
    } else if (colorKey === "right") {
      style.textAlign = "right";
    } else if (colorKey === "left") {
      style.textAlign = "left";
    }
  }

  // Font Weight
  else if (cls === "font-normal") style.fontWeight = "400";
  else if (cls === "font-medium") style.fontWeight = "500";
  else if (cls === "font-semibold") style.fontWeight = "600";
  else if (cls === "font-bold") style.fontWeight = "700";
  else if (cls === "font-extrabold") style.fontWeight = "800";

  // Border Radius
  else if (cls === "rounded") style.borderRadius = RADIUS_MAP.DEFAULT;
  else if (cls.startsWith("rounded-t-")) {
    const rKey = cls.replace("rounded-t-", "");
    const r = RADIUS_MAP[rKey] ?? parseInt(rKey, 10);
    if (!isNaN(r)) {
      style.borderTopLeftRadius = r;
      style.borderTopRightRadius = r;
    }
  } else if (cls.startsWith("rounded-b-")) {
    const rKey = cls.replace("rounded-b-", "");
    const r = RADIUS_MAP[rKey] ?? parseInt(rKey, 10);
    if (!isNaN(r)) {
      style.borderBottomLeftRadius = r;
      style.borderBottomRightRadius = r;
    }
  } else if (cls.startsWith("rounded-l-")) {
    const rKey = cls.replace("rounded-l-", "");
    const r = RADIUS_MAP[rKey] ?? parseInt(rKey, 10);
    if (!isNaN(r)) {
      style.borderTopLeftRadius = r;
      style.borderBottomLeftRadius = r;
    }
  } else if (cls.startsWith("rounded-r-")) {
    const rKey = cls.replace("rounded-r-", "");
    const r = RADIUS_MAP[rKey] ?? parseInt(rKey, 10);
    if (!isNaN(r)) {
      style.borderTopRightRadius = r;
      style.borderBottomRightRadius = r;
    }
  } else if (cls.startsWith("rounded-")) {
    const rKey = cls.replace("rounded-", "");
    if (RADIUS_MAP[rKey] !== undefined) style.borderRadius = RADIUS_MAP[rKey];
  }

  // Border Width & Color
  else if (cls === "border") style.borderWidth = 1;
  else if (cls === "border-2") style.borderWidth = 2;
  else if (cls === "border-0") style.borderWidth = 0;
  else if (cls === "border-b") style.borderBottomWidth = 1;
  else if (cls === "border-t") style.borderTopWidth = 1;
  else if (cls.startsWith("border-")) {
    const cKey = cls.replace("border-", "");
    if (COLOR_MAP[cKey]) style.borderColor = COLOR_MAP[cKey];
  }

  // Positioning
  else if (cls === "relative") style.position = "relative";
  else if (cls === "absolute") style.position = "absolute";
  else if (cls === "top-0") style.top = 0;
  else if (cls === "top-1") style.top = 4;
  else if (cls === "top-2") style.top = 8;
  else if (cls === "top-2.5") style.top = 10;
  else if (cls === "top-3") style.top = 12;
  else if (cls === "bottom-0") style.bottom = 0;
  else if (cls === "bottom-1") style.bottom = 4;
  else if (cls === "bottom-2") style.bottom = 8;
  else if (cls === "left-0") style.left = 0;
  else if (cls === "left-1") style.left = 4;
  else if (cls === "left-2") style.left = 8;
  else if (cls === "left-2.5") style.left = 10;
  else if (cls === "right-0") style.right = 0;
  else if (cls === "right-1") style.right = 4;
  else if (cls === "right-2") style.right = 8;
  else if (cls === "right-2.5") style.right = 10;
  else if (cls === "z-10") style.zIndex = 10;
  else if (cls === "z-20") style.zIndex = 20;
  else if (cls === "overflow-hidden") style.overflow = "hidden";
  else if (cls === "cursor-pointer" && isWeb) style.cursor = "pointer";
  else if (cls === "outline-none" && isWeb) {
    style.outlineStyle = "none";
    style.outlineWidth = 0;
  }

  // Glass surfaces (no elevation: Android draws it through translucent backgrounds)
  else if (cls === "glass" || cls === "glass-strong") {
    style.backgroundColor = cls === "glass" ? colors.glass : colors.glassStrong;
    style.borderWidth = 1;
    style.borderColor = colors.glassBorder;
    if (isWeb) {
      style.backdropFilter = "blur(14px) saturate(160%)";
      style.WebkitBackdropFilter = "blur(14px) saturate(160%)";
    }
  }

  // Shadows (iOS/web only; Android elevation shows through glass surfaces as grey blotches)
  else if (cls === "shadow-sm") {
    style.shadowColor = "#000";
    style.shadowOffset = { width: 0, height: 1 };
    style.shadowOpacity = 0.05;
    style.shadowRadius = 2;
  } else if (cls === "shadow-md") {
    style.shadowColor = "#000";
    style.shadowOffset = { width: 0, height: 3 };
    style.shadowOpacity = 0.08;
    style.shadowRadius = 6;
  } else if (cls === "shadow-lg") {
    style.shadowColor = "#000";
    style.shadowOffset = { width: 0, height: 6 };
    style.shadowOpacity = 0.12;
    style.shadowRadius = 12;
  }

  CLASS_CACHE.set(cls, style);
  return style;
}

/**
 * Parses space-separated Tailwind classes or conditional expressions into a StyleSheet style object.
 * Example: tw("flex-row items-center p-4 bg-white rounded-2xl shadow-md")
 */
function tw(...inputs) {
  const merged = {};

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string") {
      const tokens = input.trim().split(/\s+/);
      for (const token of tokens) {
        if (!token) continue;
        Object.assign(merged, parseSingleClass(token));
      }
    } else if (typeof input === "object") {
      Object.assign(merged, input);
    }
  }

  return merged;
}

export default tw;
