import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  Headphones,
  Laptop,
  LayoutGrid,
  Smartphone,
  Tablet,
  Watch,
} from "lucide-react-native";
import { useCategories } from "@/hooks/useStorefront";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const ICON_MAP = {
  LayoutGrid,
  Laptop,
  Smartphone,
  Tablet,
  Headphones,
  Watch,
};

export default function CategoryBar({ selected = "all", onSelect }) {
  const { data: apiCategories = [] } = useCategories();

  const categories = React.useMemo(() => {
    if (!apiCategories || !Array.isArray(apiCategories) || apiCategories.length === 0) {
      return [{ id: "all", name: "All Products" }];
    }
    const mapped = apiCategories.map((c) => ({
      id: c._id || c.id,
      name: c.categoryName || c.name || "Category",
      icon: c.icon || "Laptop",
    }));
    return [{ id: "all", name: "All Products" }, ...mapped];
  }, [apiCategories]);

  return (
    <View style={tw("my-1")}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw("px-4 gap-2")}
      >
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || LayoutGrid;
          const isSelected = selected === cat.id;

          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelect?.(cat.id)}
              style={({ pressed }) => [
                tw(
                  "flex-row items-center gap-2 py-2 px-3.5 rounded-full border shadow-sm cursor-pointer",
                  isSelected
                    ? "bg-brand border-brand"
                    : "bg-surface border-gray-100"
                ),
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <View
                style={[
                  tw("w-6 h-6 rounded-full items-center justify-center"),
                  isSelected ? tw("bg-brand-dark") : tw("bg-gray-100"),
                ]}
              >
                <Icon
                  size={14}
                  color={isSelected ? "white" : colors.gray600}
                />
              </View>
              <Text
                style={[
                  tw("text-xs font-semibold"),
                  isSelected ? tw("text-white font-bold") : tw("text-gray-700"),
                ]}
              >
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
