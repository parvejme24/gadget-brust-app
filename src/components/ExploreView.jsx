import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import Animated, { SlideInDown } from "react-native-reanimated";
import { ArrowUpDown, Check, LayoutGrid, Search, SlidersHorizontal, X } from "lucide-react-native";
import ProductCard from "./ProductCard";
import ProductGridSkeleton from "./ProductSkeleton";
import ErrorState from "./ErrorState";
import BlurBackdrop from "./BlurBackdrop";
import HeroBackground from "./HeroBackground";
import { NAV_SPACE } from "./BottomNav";
import { useBrands, useCategories, useProducts } from "@/hooks/useStorefront";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const SORTS = [
  { id: "featured", label: "Featured", desc: "Our recommended order" },
  { id: "price-low", label: "Price: Low to High", desc: "Cheapest first" },
  { id: "price-high", label: "Price: High to Low", desc: "Premium first" },
  { id: "discount", label: "Biggest Discount", desc: "Best savings first" },
];

const SEARCH_HEIGHT = 50;

/**
 * Horizontal row that also scrolls with click-and-drag on web,
 * swallowing the click that ends a drag so chips don't toggle by accident.
 */
function DraggableScrollRow({ children, contentContainerStyle, scrollRef: externalRef }) {
  const internalRef = useRef(null);
  const scrollRef = externalRef || internalRef;

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const el =
      scrollRef.current?.getScrollableNode?.() ||
      scrollRef.current?.getScrollResponder?.()?.getScrollableNode?.() ||
      scrollRef.current;

    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    const onMouseDown = (e) => {
      isDown = true;
      hasMoved = false;
      startX = e.pageX;
      scrollLeft = el.scrollLeft;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      const walk = (e.pageX - startX) * 1.25;
      if (Math.abs(walk) > 4) hasMoved = true;
      el.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
      isDown = false;
      el.style.cursor = "grab";
      el.style.removeProperty("user-select");
    };

    const onClickCapture = (e) => {
      if (hasMoved) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    el.style.cursor = "grab";
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("click", onClickCapture, true);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [scrollRef]);

  return (
    <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={contentContainerStyle}>
      {children}
    </ScrollView>
  );
}

function SortSheet({ visible, activeSort, onSelect, onClose }) {
  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={tw("flex-1 justify-end items-center")}>
        <BlurBackdrop onPress={onClose} />
        <Animated.View
          entering={SlideInDown.springify().damping(18).stiffness(160)}
          style={[tw("w-full glass-strong rounded-t-3xl pt-3 pb-8 px-5"), { maxWidth: 480 }]}
        >
          <View style={tw("w-12 h-1.5 rounded-full bg-gray-300 self-center mb-4")} />
          <View style={tw("flex-row items-center justify-between mb-3")}>
            <Text style={tw("text-base font-extrabold text-gray-900")}>Sort products</Text>
            <Pressable onPress={onClose} style={tw("w-8 h-8 rounded-full bg-gray-100 items-center justify-center cursor-pointer")}>
              <X size={16} color={colors.gray600} />
            </Pressable>
          </View>
          {SORTS.map((s) => {
            const active = activeSort === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => {
                  onSelect(s.id);
                  onClose();
                }}
                style={({ pressed }) => [
                  tw("flex-row items-center justify-between px-4 py-3.5 rounded-2xl mb-2 border cursor-pointer"),
                  active ? { backgroundColor: colors.brandLight, borderColor: colors.brand } : { backgroundColor: "#fff", borderColor: colors.gray100 },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View>
                  <Text style={[tw("text-xs font-bold"), { color: active ? colors.brandDark : colors.gray900 }]}>{s.label}</Text>
                  <Text style={[tw("text-gray-500 font-medium mt-0.5"), { fontSize: 11 }]}>{s.desc}</Text>
                </View>
                <View
                  style={[
                    tw("w-6 h-6 rounded-full items-center justify-center"),
                    active ? { backgroundColor: colors.brand } : { borderWidth: 1.5, borderColor: colors.gray300 },
                  ]}
                >
                  {active && <Check size={14} color="#fff" strokeWidth={3} />}
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function ExploreView({ initialCategory = "all", initialBrand = "all", onOpenDetail }) {
  // Load live data from REST APIs via react-query hooks
  const { data: apiProducts = [], isLoading: loadingProducts, isRefetching, refetch } = useProducts({ limit: 60 });
  const { data: apiCategories = [] } = useCategories();
  const { data: apiBrands = [] } = useBrands();

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState(initialCategory || "all");
  // Home passes a brand _id (or name as a fallback); "all" means no brand filter
  const [selectedBrand, setSelectedBrand] = useState(initialBrand && initialBrand !== "All Brands" ? initialBrand : "all");
  const [activeSort, setActiveSort] = useState("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [hero, setHero] = useState({ width: 0, height: 0 });

  const categoryScrollRef = useRef(null);
  const brandScrollRef = useRef(null);

  const categoriesList = useMemo(() => {
    const mapped = Array.isArray(apiCategories)
      ? apiCategories.map((c) => ({ id: c._id || c.id, name: c.categoryName || c.name || "Category", image: c.categoryImg?.url }))
      : [];
    return [{ id: "all", name: "All" }, ...mapped];
  }, [apiCategories]);

  const brandsList = useMemo(() => {
    const mapped = Array.isArray(apiBrands)
      ? apiBrands
          .map((b) => ({
            id: b._id || b.brandName,
            name: b.brandName || b.name,
            image: typeof b.brandImg === "string" ? b.brandImg : b.brandImg?.url,
          }))
          .filter((b) => b.name)
      : [];
    return [{ id: "all", name: "All Brands" }, ...mapped];
  }, [apiBrands]);

  // Keep the selected category chip in view
  useEffect(() => {
    const catIdx = categoriesList.findIndex((c) => c.id === selectedCat);
    if (catIdx > 0) categoryScrollRef.current?.scrollTo?.({ x: Math.max(0, catIdx * 96 - 40), animated: true });
  }, [selectedCat, categoriesList]);

  const activeBrand = brandsList.find((b) => b.id === selectedBrand || b.name === selectedBrand);
  const activeCategory = categoriesList.find((c) => c.id === selectedCat);

  // Filter and sort products using live API data
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(apiProducts)) return [];
    let list = [...apiProducts];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const desc = (p.shortDescription || "").toLowerCase();
        const cat = (p.category?.categoryName || p.category?.name || "").toLowerCase();
        const brand = (p.brand?.brandName || p.brand?.name || "").toLowerCase();
        return title.includes(q) || desc.includes(q) || cat.includes(q) || brand.includes(q);
      });
    }

    if (selectedCat !== "all") {
      const catTarget = (activeCategory?.name || selectedCat).toLowerCase();
      list = list.filter((p) => {
        const catId = p.category?._id || p.category?.id || p.category;
        const catName = (p.category?.categoryName || p.category?.name || "").toLowerCase();
        return catId === selectedCat || (catName && catName === catTarget);
      });
    }

    if (selectedBrand !== "all") {
      const brandTarget = (activeBrand?.name || selectedBrand).toLowerCase();
      list = list.filter((p) => {
        const brandId = p.brand?._id || p.brand?.id || p.brand;
        const brandName = (p.brand?.brandName || p.brand?.name || "").toLowerCase();
        return brandId === selectedBrand || brandId === activeBrand?.id || brandName === brandTarget;
      });
    }

    if (activeSort === "price-low") {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (activeSort === "price-high") {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (activeSort === "discount") {
      list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    return list;
  }, [apiProducts, search, selectedCat, selectedBrand, activeSort, activeCategory, activeBrand]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCat("all");
    setSelectedBrand("all");
    setActiveSort("featured");
  };

  const activeFilters = [
    selectedCat !== "all" && activeCategory && { key: "cat", label: activeCategory.name, onClear: () => setSelectedCat("all") },
    selectedBrand !== "all" && { key: "brand", label: activeBrand?.name || "Brand", onClear: () => setSelectedBrand("all") },
  ].filter(Boolean);
  const sortLabel = SORTS.find((s) => s.id === activeSort)?.label;

  const listHeader = (
    <View style={tw("pb-1")}>
      {/* Category chips with thumbnails */}
      <DraggableScrollRow scrollRef={categoryScrollRef} contentContainerStyle={{ paddingHorizontal: 14, gap: 8, paddingVertical: 4 }}>
        {categoriesList.map((c) => {
          const active = selectedCat === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setSelectedCat(c.id)}
              style={({ pressed }) => [
                tw("flex-row items-center gap-2 rounded-full cursor-pointer"),
                {
                  paddingLeft: 4,
                  paddingRight: 14,
                  paddingVertical: 4,
                  borderWidth: 1,
                  backgroundColor: active ? colors.brand : "#ffffff",
                  borderColor: active ? colors.brand : colors.gray100,
                },
                active && { shadowColor: colors.brand, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <View
                style={[
                  tw("items-center justify-center rounded-full overflow-hidden"),
                  { width: 30, height: 30, backgroundColor: active ? "rgba(255,255,255,0.22)" : colors.brandLight },
                ]}
              >
                {c.image ? (
                  <Image source={c.image} style={{ width: 20, height: 20 }} contentFit="contain" pointerEvents="none" />
                ) : (
                  <LayoutGrid size={15} color={active ? "#fff" : colors.brandDark} />
                )}
              </View>
              <Text style={[tw("text-xs font-bold"), { color: active ? "#fff" : colors.gray700 }]}>{c.name}</Text>
            </Pressable>
          );
        })}
      </DraggableScrollRow>

      {/* Brand logo pills */}
      <DraggableScrollRow scrollRef={brandScrollRef} contentContainerStyle={{ paddingHorizontal: 14, gap: 8, paddingVertical: 6 }}>
        {brandsList.map((b) => {
          const active = selectedBrand === b.id || (b.id !== "all" && selectedBrand === b.name);
          return (
            <Pressable
              key={b.id}
              onPress={() => setSelectedBrand(b.id)}
              style={({ pressed }) => [
                tw("flex-row items-center gap-1.5 rounded-xl cursor-pointer"),
                {
                  height: 36,
                  paddingHorizontal: 12,
                  borderWidth: 1.5,
                  backgroundColor: active ? colors.gray900 : "#ffffff",
                  borderColor: active ? colors.gray900 : colors.gray100,
                },
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              {!!b.image && !active && <Image source={b.image} style={{ width: 22, height: 16 }} contentFit="contain" pointerEvents="none" />}
              <Text style={[tw("text-xs font-bold"), { color: active ? "#fff" : colors.gray700 }]}>{b.name}</Text>
            </Pressable>
          );
        })}
      </DraggableScrollRow>

      {/* Results bar: count, active filters, sort */}
      <View style={tw("flex-row items-center justify-between px-4 mt-2 mb-1")}>
        <View style={tw("flex-1 flex-row items-center flex-wrap gap-1.5 pr-2")}>
          <Text style={tw("text-sm font-extrabold text-gray-900")}>
            {loadingProducts ? "Loading…" : `${filteredProducts.length} results`}
          </Text>
          {activeFilters.map((f) => (
            <Pressable
              key={f.key}
              onPress={f.onClear}
              style={[tw("flex-row items-center gap-1 px-2 py-0.5 rounded-full cursor-pointer"), { backgroundColor: colors.brandLight }]}
            >
              <Text style={[tw("font-bold text-brand-dark"), { fontSize: 11 }]}>{f.label}</Text>
              <X size={11} color={colors.brandDark} strokeWidth={2.6} />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => setSortOpen(true)}
          style={({ pressed }) => [
            tw("flex-row items-center gap-1.5 glass px-3 py-2 rounded-xl cursor-pointer"),
            pressed && { opacity: 0.7 },
          ]}
        >
          <ArrowUpDown size={13} color={colors.gray700} strokeWidth={2.4} />
          <Text numberOfLines={1} style={tw("text-xs font-bold text-gray-800")}>
            {activeSort === "featured" ? "Sort" : sortLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={tw("flex-1 bg-canvas")}>
      {/* Hero with title and floating search */}
      <View style={{ marginBottom: SEARCH_HEIGHT / 2 + 8 }}>
        <View
          onLayout={(e) => setHero({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
          style={{
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            overflow: "hidden",
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: SEARCH_HEIGHT / 2 + 16,
          }}
        >
          <HeroBackground id="explore-hero" width={hero.width} height={hero.height} />
          <View style={tw("flex-row items-center justify-between")}>
            <View>
              <Text style={[tw("text-white font-black"), { fontSize: 22 }]}>Explore Gadgets</Text>
              <Text style={[tw("text-xs font-medium mt-0.5"), { color: "rgba(255,255,255,0.78)" }]}>
                {apiProducts.length > 0 ? `${apiProducts.length}+ genuine products in stock` : "Official catalog"}
              </Text>
            </View>
            {(activeFilters.length > 0 || activeSort !== "featured" || !!search) && (
              <Pressable
                onPress={handleResetFilters}
                style={({ pressed }) => [
                  tw("px-3 py-1.5 rounded-full cursor-pointer"),
                  { backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={tw("text-white text-xs font-bold")}>Reset</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: -SEARCH_HEIGHT / 2,
            height: SEARCH_HEIGHT,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingLeft: 16,
            paddingRight: 6,
            borderRadius: 18,
            // solid: it overlaps the green hero, which would show through glass
          backgroundColor: "#ffffff",
          borderColor: colors.glassBorder,
            shadowColor: "#0f3d2e",
            shadowOpacity: 0.16,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
          }}
        >
          <Search size={18} color={colors.gray400} strokeWidth={2.2} />
          <TextInput
            placeholder="Search laptops, phones, audio..."
            placeholderTextColor={colors.gray400}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            style={tw("flex-1 text-sm text-gray-900 p-0 font-medium")}
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")} style={tw("w-7 h-7 rounded-full bg-gray-100 items-center justify-center cursor-pointer")}>
              <X size={13} color={colors.gray600} />
            </Pressable>
          )}
          <Pressable
            onPress={() => setSortOpen(true)}
            style={({ pressed }) => [
              { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.brand },
              tw("cursor-pointer"),
              pressed && { transform: [{ scale: 0.9 }] },
            ]}
          >
            <SlidersHorizontal size={16} color="#fff" strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>

      {/* Products grid */}
      <FlatList
        data={loadingProducts && filteredProducts.length === 0 ? [] : filteredProducts}
        keyExtractor={(p) => p._id}
        numColumns={2}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ paddingBottom: NAV_SPACE }}
        columnWrapperStyle={filteredProducts.length > 0 ? tw("justify-between px-2.5") : undefined}
        onRefresh={refetch}
        refreshing={isRefetching}
        renderItem={({ item, index }) => <ProductCard product={item} index={index} onOpenDetail={onOpenDetail} />}
        ListEmptyComponent={() => {
          if (loadingProducts) return <ProductGridSkeleton count={6} />;
          if (search.trim()) {
            return (
              <ErrorState
                type="empty-search"
                title={`No gadgets found for "${search}"`}
                desc="We couldn't find any items matching your search. Try checking spelling or resetting filters."
                actionText="Reset All Filters"
                onAction={handleResetFilters}
              />
            );
          }
          return (
            <ErrorState
              type="empty-filter"
              title="No gadgets match your filters"
              desc="Nothing matches this category and brand combination. Try another category or clear the brand."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
      />

      <SortSheet visible={sortOpen} activeSort={activeSort} onSelect={setActiveSort} onClose={() => setSortOpen(false)} />
    </View>
  );
}
