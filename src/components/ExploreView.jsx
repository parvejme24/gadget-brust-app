import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  X,
} from "lucide-react-native";
import ProductCard from "./ProductCard";
import ProductGridSkeleton from "./ProductSkeleton";
import ErrorState from "./ErrorState";
import { useBrands, useCategories, useProducts } from "@/hooks/useStorefront";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "discount", label: "Biggest Discount" },
];

/**
 * DraggableScrollRow enables:
 * 1. Native touch swipe left/right on mobile.
 * 2. Mouse click-and-drag horizontal scroll on web / desktop.
 * 3. Native event capture preventing accidental tab clicks during drag.
 */
function DraggableScrollRow({
  children,
  contentContainerStyle,
  style,
  scrollRef: externalRef,
}) {
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
      startX = e.pageX - (el.offsetLeft || 0);
      scrollLeft = el.scrollLeft;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      const x = e.pageX - (el.offsetLeft || 0);
      const walk = (x - startX) * 1.25;
      if (Math.abs(walk) > 4) {
        hasMoved = true;
      }
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
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={contentContainerStyle}
    >
      {children}
    </ScrollView>
  );
}

export default function ExploreView({
  initialCategory = "all",
  initialBrand = "All Brands",
  onOpenDetail,
}) {
  // Load live data from REST APIs via react-query hooks
  const {
    data: apiProducts = [],
    isLoading: loadingProducts,
    isRefetching,
    refetch,
  } = useProducts({ limit: 60 });
  const { data: apiCategories = [] } = useCategories();
  const { data: apiBrands = [] } = useBrands();

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(
    initialBrand && initialBrand !== "all" ? initialBrand : "All Brands"
  );
  const [activeSort, setActiveSort] = useState("featured");

  const categoryScrollRef = useRef(null);
  const brandScrollRef = useRef(null);
  const sortScrollRef = useRef(null);

  // Dynamic categories directly from backend
  const categoriesList = useMemo(() => {
    if (!apiCategories || !Array.isArray(apiCategories)) return [{ id: "all", name: "All" }];
    const mapped = apiCategories.map((c) => ({
      id: c._id || c.id,
      name: c.categoryName || c.name || "Category",
      icon: c.icon,
    }));
    return [{ id: "all", name: "All" }, ...mapped];
  }, [apiCategories]);

  // Dynamic brands directly from backend
  const brandsList = useMemo(() => {
    if (!apiBrands || !Array.isArray(apiBrands)) return ["All Brands"];
    const names = apiBrands.map((b) => b.brandName || b.name).filter(Boolean);
    return ["All Brands", ...names];
  }, [apiBrands]);

  // Synchronize category pills auto-scroll when selectedCat changes
  useEffect(() => {
    const catIdx = categoriesList.findIndex((c) => c.id === selectedCat);
    if (categoryScrollRef.current && catIdx >= 0) {
      const node =
        categoryScrollRef.current?.getScrollableNode?.() ||
        categoryScrollRef.current?.getScrollResponder?.()?.getScrollableNode?.() ||
        categoryScrollRef.current;

      if (node && typeof node.scrollTo === "function") {
        node.scrollTo({ left: Math.max(0, catIdx * 80 - 30), behavior: "smooth" });
      } else if (categoryScrollRef.current?.scrollTo) {
        categoryScrollRef.current.scrollTo({
          x: Math.max(0, catIdx * 80 - 30),
          animated: true,
        });
      }
    }
  }, [selectedCat, categoriesList]);

  // Quick arrow scroll helpers for categories on desktop/web
  const scrollCategoryLeft = useCallback(() => {
    const node =
      categoryScrollRef.current?.getScrollableNode?.() ||
      categoryScrollRef.current?.getScrollResponder?.()?.getScrollableNode?.() ||
      categoryScrollRef.current;

    if (node && typeof node.scrollBy === "function") {
      node.scrollBy({ left: -180, behavior: "smooth" });
    } else if (categoryScrollRef.current?.scrollTo) {
      categoryScrollRef.current.scrollTo({ x: 0, animated: true });
    }
  }, []);

  const scrollCategoryRight = useCallback(() => {
    const node =
      categoryScrollRef.current?.getScrollableNode?.() ||
      categoryScrollRef.current?.getScrollResponder?.()?.getScrollableNode?.() ||
      categoryScrollRef.current;

    if (node && typeof node.scrollBy === "function") {
      node.scrollBy({ left: 180, behavior: "smooth" });
    } else if (categoryScrollRef.current?.scrollTo) {
      categoryScrollRef.current.scrollTo({ x: 400, animated: true });
    }
  }, []);

  // Filter and sort products using live API data
  const filteredProducts = useMemo(() => {
    if (!apiProducts || !Array.isArray(apiProducts)) return [];
    let list = [...apiProducts];

    // Search query filter
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

    // Category filter
    if (selectedCat !== "all") {
      list = list.filter((p) => {
        const catId = p.category?._id || p.category?.id || p.category;
        const catName = (p.category?.categoryName || p.category?.name || "").toLowerCase();
        const title = (p.title || "").toLowerCase();
        const catTarget = selectedCat.toLowerCase();

        if (catId === selectedCat) return true;
        if (catName && catName.includes(catTarget)) return true;

        // Keyword fallback for common categories
        if (catTarget === "laptop") return title.includes("macbook") || title.includes("zenbook") || title.includes("matebook") || title.includes("laptop");
        if (catTarget === "phone") return title.includes("iphone") || title.includes("phone") || title.includes("galaxy");
        if (catTarget === "audio") return title.includes("headphone") || title.includes("audio") || title.includes("earbuds") || title.includes("wh-");
        if (catTarget === "watch") return title.includes("watch");
        if (catTarget === "tablet") return title.includes("pad") || title.includes("tablet");
        return false;
      });
    }

    // Brand filter
    if (selectedBrand !== "All Brands") {
      const bTarget = selectedBrand.toLowerCase();
      list = list.filter((p) => {
        const brandName = (p.brand?.brandName || p.brand?.name || "").toLowerCase();
        const title = (p.title || "").toLowerCase();
        return brandName.includes(bTarget) || title.includes(bTarget);
      });
    }

    // Sort order
    if (activeSort === "price-low") {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (activeSort === "price-high") {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (activeSort === "discount") {
      list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    return list;
  }, [apiProducts, search, selectedCat, selectedBrand, activeSort]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCat("all");
    setSelectedBrand("All Brands");
    setActiveSort("featured");
  };

  return (
    <View style={tw("flex-1 bg-canvas")}>
      {/* Search, Filter & Tabs Header */}
      <View style={tw("p-4 bg-surface border-b border-gray-100 gap-3")}>
        {/* Title & Live Status Header */}
        <View style={tw("flex-row items-center justify-between")}>
          <View>
            <Text style={tw("text-lg font-black text-gray-900")}>Explore Gadgets</Text>
            <Text style={tw("text-xs text-gray-400 font-medium")}>
              {loadingProducts ? "Loading catalog..." : `${filteredProducts.length} items available`}
            </Text>
          </View>

          <View style={tw("flex-row items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100")}>
            <Sparkles size={12} color={colors.brand} />
            <Text style={tw("text-xs font-bold text-brand")}>
              {apiProducts.length > 0 ? "Live API" : "Official Catalog"}
            </Text>
          </View>
        </View>

        {/* Search Input Field */}
        <View style={tw("flex-row items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 gap-2.5")}>
          <Search size={16} color={colors.gray400} />
          <TextInput
            placeholder="Search all laptops, phones, audio..."
            placeholderTextColor={colors.gray400}
            value={search}
            onChangeText={setSearch}
            style={tw("flex-1 text-xs text-gray-900 p-0 font-medium")}
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")} style={tw("p-1")}>
              <X size={14} color={colors.gray400} />
            </Pressable>
          )}
        </View>

        {/* CATEGORY TABS (Touch swipeable & Mouse-draggable) */}
        <View style={tw("flex-row items-center gap-1")}>
          <Pressable
            onPress={scrollCategoryLeft}
            style={({ pressed }) => [
              tw("w-7 h-7 rounded-full bg-gray-100 items-center justify-center cursor-pointer"),
              pressed && { opacity: 0.7 },
            ]}
          >
            <ChevronLeft size={14} color={colors.gray600} />
          </Pressable>

          <View style={tw("flex-1")}>
            <DraggableScrollRow
              scrollRef={categoryScrollRef}
              contentContainerStyle={tw("gap-2 pr-4 py-0.5")}
            >
              {categoriesList.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setSelectedCat(c.id)}
                  style={({ pressed }) => [
                    tw("px-3.5 py-1.5 rounded-full border cursor-pointer"),
                    selectedCat === c.id
                      ? tw("bg-brand border-brand shadow-xs")
                      : tw("bg-white border-gray-200"),
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text
                    style={[
                      tw("text-xs font-semibold"),
                      selectedCat === c.id ? tw("text-white font-bold") : tw("text-gray-700"),
                    ]}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </DraggableScrollRow>
          </View>

          <Pressable
            onPress={scrollCategoryRight}
            style={({ pressed }) => [
              tw("w-7 h-7 rounded-full bg-gray-100 items-center justify-center cursor-pointer"),
              pressed && { opacity: 0.7 },
            ]}
          >
            <ChevronRight size={14} color={colors.gray600} />
          </Pressable>
        </View>

        {/* BRAND TABS (Touch swipeable & Mouse-draggable) */}
        <DraggableScrollRow
          scrollRef={brandScrollRef}
          contentContainerStyle={tw("gap-1.5 py-0.5")}
        >
          {brandsList.map((brand) => (
            <Pressable
              key={brand}
              onPress={() => setSelectedBrand(brand)}
              style={({ pressed }) => [
                tw("px-3 py-1 rounded-lg border cursor-pointer"),
                selectedBrand === brand
                  ? tw("bg-gray-900 border-gray-900 shadow-xs")
                  : tw("bg-gray-100 border-transparent"),
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text
                style={[
                  tw("text-xs"),
                  selectedBrand === brand ? tw("text-white font-bold") : tw("text-gray-600"),
                ]}
              >
                {brand}
              </Text>
            </Pressable>
          ))}
        </DraggableScrollRow>

        {/* SORT TABS (Touch swipeable & Mouse-draggable) */}
        <View style={tw("flex-row items-center gap-1.5")}>
          <ArrowUpDown size={12} color={colors.gray400} />
          <View style={tw("flex-1")}>
            <DraggableScrollRow
              scrollRef={sortScrollRef}
              contentContainerStyle={tw("gap-1.5 py-0.5")}
            >
              {SORTS.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => setActiveSort(s.id)}
                  style={({ pressed }) => [
                    tw("px-2.5 py-0.5 rounded-full cursor-pointer"),
                    activeSort === s.id ? tw("bg-emerald-100") : tw("bg-transparent"),
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      tw("text-xs font-medium"),
                      activeSort === s.id ? tw("text-emerald-800 font-bold") : tw("text-gray-500"),
                    ]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </DraggableScrollRow>
          </View>
        </View>
      </View>

      {/* PRODUCTS 2-COLUMN GRID (Connected to APIs with Skeletons & Error Handling) */}
      <FlatList
        data={loadingProducts && filteredProducts.length === 0 ? [] : filteredProducts}
        keyExtractor={(p) => p._id}
        numColumns={2}
        contentContainerStyle={tw("p-2 pb-24")}
        columnWrapperStyle={filteredProducts.length > 0 ? tw("justify-between px-1") : undefined}
        onRefresh={refetch}
        refreshing={isRefetching}
        renderItem={({ item, index }) => (
          <ProductCard
            product={item}
            index={index}
            onOpenDetail={onOpenDetail}
          />
        )}
        ListEmptyComponent={() => {
          if (loadingProducts) {
            return <ProductGridSkeleton count={6} />;
          }
          if (search.trim()) {
            return (
              <ErrorState
                type="empty-search"
                title={`No gadgets found for "${search}"`}
                desc="We couldn't find any items matching your search query. Try checking spelling or resetting filters."
                actionText="Reset All Filters"
                onAction={handleResetFilters}
              />
            );
          }
          return (
            <ErrorState
              type="empty-filter"
              title="No gadgets match your filters"
              desc="There are no products matching this category and brand combination. Try switching categories or clearing brands."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
