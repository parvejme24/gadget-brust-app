import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, Text, useWindowDimensions, View } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import { Image } from "expo-image";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react-native";
import { useSliderProducts } from "@/hooks/useStorefront";
import { formatTaka, getFinalPrice } from "@/lib/format";
import tw from "@/lib/tw";

const GRADIENTS = [
  ["#34d399", "#047857"],
  ["#60a5fa", "#1d4ed8"],
  ["#a78bfa", "#6d28d9"],
  ["#fbbf24", "#c2410c"],
  ["#f472b6", "#be185d"],
];

const SIDE_PADDING = 16;
const GAP = 12;
const MAX_CARD_WIDTH = 560;
const AUTOPLAY_MS = 4500;
const isWeb = Platform.OS === "web";

// Sizes the card from the slider's own container (not the window), since on web the app
// lives inside a max-width frame; falls back to the window width until the first layout pass
function useBannerSize(containerWidth) {
  const { width: windowWidth } = useWindowDimensions();
  const width = containerWidth || windowWidth;
  const cardWidth = Math.max(Math.min(width - SIDE_PADDING * 2, MAX_CARD_WIDTH), 0);
  const cardHeight = Math.round(Math.min(Math.max(cardWidth * 0.5, 160), 230));
  return { cardWidth, cardHeight, interval: cardWidth + GAP };
}

function BannerBackground({ id, colors, width, height }) {
  const gradId = `grad-${id}`;
  return (
    <Svg width={width} height={height} pointerEvents="none" style={{ position: "absolute", top: 0, left: 0 }}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors[0]} />
          <Stop offset="1" stopColor={colors[1]} />
        </LinearGradient>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${gradId})`} />
      {/* Decorative glow rings */}
      <Circle cx={width * 0.82} cy={height * 0.5} r={height * 0.62} fill="#ffffff" fillOpacity={0.12} />
      <Circle cx={width * 0.82} cy={height * 0.5} r={height * 0.42} fill="#ffffff" fillOpacity={0.14} />
      <Circle cx={width * 0.08} cy={height * 1.05} r={height * 0.35} fill="#ffffff" fillOpacity={0.08} />
    </Svg>
  );
}

function BannerSlide({ banner, index, scrollX, size, onPress }) {
  const { cardWidth, cardHeight, interval } = size;
  const imageSize = Math.round(cardHeight * 0.78);
  const inputRange = [(index - 1) * interval, index * interval, (index + 1) * interval];

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(scrollX.value, inputRange, [0.94, 1, 0.94], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(scrollX.value, inputRange, [0.75, 1, 0.75], Extrapolation.CLAMP),
  }));

  // Parallax: the product drifts slower than the card for depth
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(scrollX.value, inputRange, [cardWidth * 0.25, 0, -cardWidth * 0.25], Extrapolation.CLAMP) },
      { rotate: `${interpolate(scrollX.value, inputRange, [8, 0, -8], Extrapolation.CLAMP)}deg` },
    ],
  }));

  return (
    <Animated.View style={[{ width: cardWidth, height: cardHeight, marginRight: GAP }, cardStyle]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          {
            flex: 1,
            borderRadius: 24,
            overflow: "hidden",
            shadowColor: banner.colors[1],
            shadowOpacity: 0.35,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
          },
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <BannerBackground id={banner.id} colors={banner.colors} width={cardWidth} height={cardHeight} />

        <View style={tw("flex-1 flex-row p-4")}>
          <View style={[tw("flex-1 justify-between"), { paddingRight: imageSize * 0.55 }]}>
            <View style={tw("flex-row items-center gap-1.5")}>
              <View style={[tw("flex-row items-center gap-1 px-2.5 py-1 rounded-full"), { backgroundColor: "rgba(255,255,255,0.22)" }]}>
                <Sparkles size={11} color="#fff" />
                <Text style={[tw("text-white font-black"), { fontSize: 10, letterSpacing: 0.6 }]}>{banner.tag}</Text>
              </View>
            </View>

            <View>
              <Text numberOfLines={2} style={[tw("text-white font-extrabold"), { fontSize: cardHeight > 190 ? 22 : 18, lineHeight: cardHeight > 190 ? 27 : 22 }]}>
                {banner.title}
              </Text>
              <View style={tw("flex-row items-end gap-2 mt-1.5")}>
                <Text style={[tw("text-white font-black"), { fontSize: 18 }]}>{banner.price}</Text>
                {!!banner.oldPrice && (
                  <Text style={[tw("text-xs font-semibold"), { color: "rgba(255,255,255,0.7)", textDecorationLine: "line-through", marginBottom: 2 }]}>
                    {banner.oldPrice}
                  </Text>
                )}
              </View>
              <View style={tw("flex-row items-center gap-1 mt-1")}>
                <ShieldCheck size={11} color="rgba(255,255,255,0.85)" />
                <Text style={[tw("text-xs font-medium"), { color: "rgba(255,255,255,0.85)" }]}>Official warranty</Text>
              </View>
            </View>

            <View style={tw("self-start flex-row items-center gap-1.5 bg-white px-3.5 py-2 rounded-full")}>
              <Text style={tw("text-xs font-extrabold text-gray-900")}>Shop Now</Text>
              <ArrowRight size={13} color={banner.colors[1]} strokeWidth={2.5} />
            </View>
          </View>

          {!!banner.image && (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  right: 8,
                  top: (cardHeight - imageSize) / 2,
                  width: imageSize,
                  height: imageSize,
                },
                imageStyle,
              ]}
            >
              <Image source={banner.image} style={{ width: "100%", height: "100%" }} contentFit="contain" transition={250} />
            </Animated.View>
          )}

          {banner.discount > 0 && (
            <View style={[tw("absolute items-center justify-center rounded-full bg-white"), { top: 12, right: 12, width: 46, height: 46 }]}>
              <Text style={[tw("font-black"), { fontSize: 14, color: banner.colors[1], lineHeight: 16 }]}>{banner.discount}%</Text>
              <Text style={[tw("font-bold"), { fontSize: 9, color: banner.colors[1], lineHeight: 10 }]}>OFF</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Dot({ index, scrollX, interval, color }) {
  const style = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * interval, index * interval, (index + 1) * interval];
    return {
      width: interpolate(scrollX.value, inputRange, [6, 22, 6], Extrapolation.CLAMP),
      opacity: interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: color }, style]} />;
}

export default function PromoBanner({ onSelectProduct }) {
  const { data: sliderProducts = [], isLoading } = useSliderProducts();
  const [containerWidth, setContainerWidth] = useState(0);
  const size = useBannerSize(containerWidth);
  const onContainerLayout = useCallback((e) => {
    const w = Math.round(e.nativeEvent.layout.width);
    setContainerWidth((prev) => (prev === w ? prev : w));
  }, []);
  const scrollX = useSharedValue(0);
  const listRef = useRef(null);
  const activeIdxRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Generate dynamic banners directly from live API slider products
  const banners = useMemo(() => {
    if (!Array.isArray(sliderProducts)) return [];
    return sliderProducts.slice(0, 5).map((p, idx) => {
      const finalPrice = getFinalPrice(p);
      return {
        id: p._id,
        tag: p.discount > 0 ? "MEGA DEAL" : "SPECIAL OFFER",
        title: p.title,
        discount: p.discount || 0,
        price: formatTaka(finalPrice),
        oldPrice: p.price > finalPrice ? formatTaka(p.price) : null,
        colors: GRADIENTS[idx % GRADIENTS.length],
        image: p.image?.url,
        rawProduct: p,
      };
    });
  }, [sliderProducts]);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const syncActiveIdx = useCallback(
    (offsetX) => {
      activeIdxRef.current = Math.round(offsetX / size.interval);
    },
    [size.interval]
  );

  // Web: ScrollView ignores mouse drags, so pan the list manually and snap to the nearest slide
  const dragStartOffset = useRef(0);
  const justDragged = useRef(false);
  const panGesture = usePanGesture({
    enabled: isWeb && banners.length > 1,
    runOnJS: true,
    activeOffsetX: [-8, 8],
    failOffsetY: [-12, 12],
    activeCursor: "grabbing",
    onActivate: () => {
      dragStartOffset.current = activeIdxRef.current * size.interval;
      setIsDragging(true);
    },
    onUpdate: (e) => {
      listRef.current?.scrollToOffset({ offset: Math.max(dragStartOffset.current - e.translationX, 0), animated: false });
    },
    onDeactivate: (e) => {
      const startIdx = activeIdxRef.current;
      const swipe = e.translationX + e.velocityX * 0.15;
      let next = startIdx;
      if (swipe < -size.interval * 0.2) next = startIdx + 1;
      else if (swipe > size.interval * 0.2) next = startIdx - 1;
      next = Math.min(Math.max(next, 0), banners.length - 1);
      activeIdxRef.current = next;
      listRef.current?.scrollToOffset({ offset: next * size.interval, animated: true });
      justDragged.current = true;
      setTimeout(() => {
        justDragged.current = false;
      }, 250);
      setIsDragging(false);
    },
  });

  // Ignore the click that fires at the end of a mouse drag
  const handleSlidePress = (product) => {
    if (justDragged.current) return;
    if (product) onSelectProduct?.(product);
  };

  // Autoplay, paused while the user is swiping
  useEffect(() => {
    if (banners.length < 2 || isDragging) return undefined;
    const timer = setInterval(() => {
      const next = (activeIdxRef.current + 1) % banners.length;
      activeIdxRef.current = next;
      listRef.current?.scrollToOffset({ offset: next * size.interval, animated: true });
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [banners.length, isDragging, size.interval]);

  if (banners.length === 0) {
    if (isLoading) {
      return (
        <View onLayout={onContainerLayout} style={tw("my-2 px-4")}>
          <View style={[tw("bg-gray-100"), { height: size.cardHeight, borderRadius: 24 }]} />
        </View>
      );
    }
    return null;
  }

  return (
    <View onLayout={onContainerLayout} style={tw("my-2")}>
      <GestureDetector gesture={panGesture}>
        <View style={isWeb ? { cursor: "grab", userSelect: "none" } : undefined}>
          <Animated.FlatList
            ref={listRef}
            data={banners}
            keyExtractor={(b) => b.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={size.interval}
            decelerationRate="fast"
            disableIntervalMomentum
            contentContainerStyle={{ paddingHorizontal: SIDE_PADDING, paddingVertical: 10 }}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => setIsDragging(true)}
            onScrollEndDrag={(e) => {
              syncActiveIdx(e.nativeEvent.contentOffset.x);
              setIsDragging(false);
            }}
            onMomentumScrollEnd={(e) => syncActiveIdx(e.nativeEvent.contentOffset.x)}
            getItemLayout={(_, index) => ({ length: size.interval, offset: size.interval * index, index })}
            renderItem={({ item, index }) => (
              <BannerSlide
                banner={item}
                index={index}
                scrollX={scrollX}
                size={size}
                onPress={() => handleSlidePress(item.rawProduct)}
              />
            )}
          />
        </View>
      </GestureDetector>

      {/* Animated dots indicator */}
      {banners.length > 1 && (
        <View style={tw("flex-row items-center justify-center gap-1.5 mt-1")}>
          {banners.map((b, idx) => (
            <Dot key={b.id} index={idx} scrollX={scrollX} interval={size.interval} color={b.colors[1]} />
          ))}
        </View>
      )}
    </View>
  );
}
