import { useCallback, useRef } from "react";
import { Platform } from "react-native";
import { usePanGesture } from "react-native-gesture-handler";

const isWeb = Platform.OS === "web";

// Horizontal ScrollViews ignore mouse drags on web; this pans them by hand with a little momentum.
// Wrap the ScrollView in <GestureDetector gesture={gesture}> and pass scrollRef/onScroll to it.
export default function useWebDragScroll() {
  const scrollRef = useRef(null);
  const offsetX = useRef(0);
  const startX = useRef(0);
  const justDragged = useRef(false);

  const gesture = usePanGesture({
    enabled: isWeb,
    runOnJS: true,
    activeOffsetX: [-6, 6],
    failOffsetY: [-12, 12],
    activeCursor: "grabbing",
    onActivate: () => {
      startX.current = offsetX.current;
    },
    onUpdate: (e) => {
      scrollRef.current?.scrollTo({ x: Math.max(startX.current - e.translationX, 0), animated: false });
    },
    onDeactivate: (e) => {
      scrollRef.current?.scrollTo({ x: Math.max(offsetX.current - e.velocityX * 0.2, 0), animated: true });
      justDragged.current = true;
      setTimeout(() => {
        justDragged.current = false;
      }, 250);
    },
  });

  const onScroll = useCallback((e) => {
    offsetX.current = e.nativeEvent.contentOffset.x;
  }, []);

  // Call in onPress handlers to skip the click fired at the end of a drag
  const wasDragged = useCallback(() => justDragged.current, []);

  return { gesture, scrollRef, onScroll, wasDragged, dragStyle: isWeb ? { cursor: "grab", userSelect: "none" } : undefined };
}
