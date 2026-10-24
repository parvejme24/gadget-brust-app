import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import {
  Flame,
  RefreshCw,
  WifiOff,
} from "lucide-react-native";
import { BlurTargetView } from "expo-blur";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import {
  useBrands,
  useCategories,
  useDiscountedProducts,
} from "@/hooks/useStorefront";
import ProductCard from "@/components/ProductCard";
import PromoBanner from "@/components/PromoBanner";
import CategoryShowcase from "@/components/CategoryShowcase";
import BrandShowcase from "@/components/BrandShowcase";
import BottomNav, { NAV_SPACE } from "@/components/BottomNav";
import ExploreView from "@/components/ExploreView";
import WishlistView from "@/components/WishlistView";
import CartView from "@/components/CartView";
import AccountView from "@/components/AccountView";
import NotificationModal from "@/components/NotificationModal";
import AuthModal from "@/components/AuthModal";
import { BlurTargetContext } from "@/components/BlurBackdrop";
import ProductDetailModal from "@/components/ProductDetailModal";
import HomeHeader from "@/components/HomeHeader";
import ProductGridSkeleton from "@/components/ProductSkeleton";
import ErrorState from "@/components/ErrorState";
import AppBackground from "@/components/AppBackground";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const TAB_ORDER = ["home", "explore", "wishlist", "cart", "profile"];

export default function AppEntry() {
  const { data: liveProducts = [], isLoading: loadingProducts, isError: errorProducts, refetch, isRefetching } = useDiscountedProducts();
  const { data: liveCategories = [], isLoading: loadingCategories } = useCategories();
  const { data: liveBrands = [], isLoading: loadingBrands } = useBrands();

  const [activeTab, setActiveTabState] = useState("home");
  // +1 when moving to a tab further right in the nav, -1 when moving left (drives the slide direction)
  const [tabDirection, setTabDirection] = useState(1);
  const setActiveTab = (tab) => {
    if (tab === activeTab) return;
    setTabDirection(TAB_ORDER.indexOf(tab) >= TAB_ORDER.indexOf(activeTab) ? 1 : -1);
    setActiveTabState(tab);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("all");
  const [selectedFilterBrand, setSelectedFilterBrand] = useState("all");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const blurTargetRef = useRef(null);

  // Synchronized catalog data directly from backend REST APIs
  const categoriesList = liveCategories;
  const brandsList = liveBrands;

  // Filtered products for home view directly from live backend
  const displayProducts = useMemo(() => {
    if (!liveProducts || !Array.isArray(liveProducts)) return [];
    if (!searchQuery.trim()) return liveProducts;
    const q = searchQuery.toLowerCase();
    return liveProducts.filter((p) => p.title?.toLowerCase().includes(q));
  }, [liveProducts, searchQuery]);

  const isLive = liveProducts && liveProducts.length > 0;

  const handleSelectCategory = (cat) => {
    const catName = cat.categoryName || cat.label || "all";
    setSelectedFilterCategory(cat._id || cat.id || catName);
    setActiveTab("explore");
  };

  const handleSelectBrand = (brand) => {
    setSelectedFilterBrand(brand._id || brand.brandName);
    setActiveTab("explore");
  };

  const renderHomeHeader = () => (
    <View style={tw("pb-2")}>
      {/* Branded hero: logo, cart/notifications, greeting and floating search */}
      <HomeHeader
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onOpenNotifications={() => setShowNotificationModal(true)}
        onOpenCart={() => setActiveTab("cart")}
        onOpenFilters={() => setActiveTab("explore")}
      />

      {/* Live / Offline Status Banner with Meaningful Icon & Spinner */}
      {errorProducts && (
        <View style={tw("mx-4 my-2 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex-row items-center gap-3 shadow-xs")}>
          <View style={tw("w-9 h-9 rounded-xl bg-amber-100 items-center justify-center")}>
            <WifiOff size={18} color={colors.amber500} strokeWidth={2.2} />
          </View>
          <View style={tw("flex-1")}>
            <Text style={tw("text-xs font-bold text-amber-900")}>
              You are currently offline
            </Text>
            <Text style={tw("text-xs text-amber-700 font-medium")}>
              Showing verified offline catalog • Instant reconnect ready
            </Text>
          </View>
          <Pressable
            onPress={() => refetch()}
            disabled={isRefetching}
            style={({ pressed }) => [
              tw("flex-row items-center gap-1.5 cursor-pointer bg-amber-200/80 px-3 py-1.5 rounded-full"),
              pressed && { opacity: 0.8 },
            ]}
          >
            {isRefetching ? (
              <ActivityIndicator size="small" color={colors.amber900} />
            ) : (
              <RefreshCw size={12} color={colors.amber900} strokeWidth={2.5} />
            )}
            <Text style={tw("text-xs text-amber-900 font-extrabold")}>
              {isRefetching ? "Connecting..." : "Retry"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Hero Promo Banner Carousel */}
      <PromoBanner onSelectProduct={(prod) => setSelectedProduct(prod)} />

      {/* Shop by Category Showcase (Backend Synchronized) */}
      <CategoryShowcase
        categories={categoriesList}
        isLoading={loadingCategories}
        onSelectCategory={handleSelectCategory}
        onSeeAll={() => setActiveTab("explore")}
      />

      {/* Official Brand Stores (Backend Synchronized) */}
      <BrandShowcase brands={brandsList} isLoading={loadingBrands} onSelectBrand={handleSelectBrand} />

      {/* Flash Deals Header */}
      <View style={tw("flex-row items-center justify-between px-4 mt-5 mb-1")}>
        <View style={tw("flex-row items-center gap-2")}>
          <Flame size={22} color={colors.red500} />
          <Text style={tw("text-lg font-extrabold text-gray-900")}>Flash Deals & Live Offers</Text>
          {isLive && (
            <View style={tw("flex-row items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200")}>
              <View style={tw("w-1.5 h-1.5 rounded-full bg-brand")} />
              <Text style={tw("text-xs font-bold text-brand-dark")}>LIVE</Text>
            </View>
          )}
        </View>
        {loadingProducts && <ActivityIndicator size="small" color={colors.brand} />}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={tw("flex-1 bg-canvas")}>
      <AppBackground />
      {/* Lets every drawer's backdrop blur the screen on Android */}
      <BlurTargetContext value={blurTargetRef}>
        {/* Everything the drawer backdrop blurs (Android needs an explicit target) */}
        <BlurTargetView ref={blurTargetRef} style={tw("flex-1")}>
          {/* Tab Content: re-keyed per tab so each one slides in from the side you moved towards */}
          <Animated.View
            key={activeTab}
            entering={(tabDirection > 0 ? FadeInRight : FadeInLeft).duration(280).springify().damping(18)}
            style={tw("flex-1")}
          >
            {activeTab === "home" && (
              <FlatList
                data={loadingProducts && displayProducts.length === 0 ? [] : displayProducts}
                keyExtractor={(p) => p._id}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: NAV_SPACE }}
                columnWrapperStyle={displayProducts.length > 0 ? tw("justify-between px-2.5") : undefined}
                onRefresh={refetch}
                refreshing={isRefetching}
                ListHeaderComponent={renderHomeHeader}
                ListEmptyComponent={() => {
                  if (loadingProducts) {
                    return <ProductGridSkeleton count={6} />;
                  }
                  if (searchQuery.trim()) {
                    return (
                      <ErrorState
                        type="empty-search"
                        title={`No matches for "${searchQuery}"`}
                        desc="Check spelling or search for popular laptops, phones, earbuds, and accessories."
                        actionText="Clear Search Query"
                        onAction={() => setSearchQuery("")}
                      />
                    );
                  }
                  if (errorProducts) {
                    return (
                      <ErrorState
                        type="offline"
                        title="You are offline"
                        desc="Could not establish connection to the store catalog. Showing cached offline data."
                        actionText="Retry Connection"
                        isLoading={isRefetching}
                        onAction={() => refetch()}
                      />
                    );
                  }
                  return null;
                }}
                renderItem={({ item, index }) => (
                  <ProductCard
                    product={item}
                    index={index}
                    onOpenDetail={(prod) => setSelectedProduct(prod)}
                  />
                )}
                showsVerticalScrollIndicator={false}
              />
            )}

            {activeTab === "explore" && (
              <ExploreView
                initialCategory={selectedFilterCategory}
                initialBrand={selectedFilterBrand}
                onOpenDetail={(prod) => setSelectedProduct(prod)}
              />
            )}

            {activeTab === "wishlist" && (
              <WishlistView
                onExplore={() => setActiveTab("home")}
                onOpenDetail={(prod) => setSelectedProduct(prod)}
              />
            )}

            {activeTab === "cart" && (
              <CartView
                onExplore={() => setActiveTab("home")}
              />
            )}

            {activeTab === "profile" && (
              <AccountView
                onOpenWishlist={() => setActiveTab("wishlist")}
                onOpenCart={() => setActiveTab("cart")}
              />
            )}
          </Animated.View>

          {/* Bottom Nav */}
          <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
        </BlurTargetView>

        {/* Product Details Modal */}
        <ProductDetailModal
          visible={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onGoToCart={() => {
            setSelectedProduct(null);
            setActiveTab("cart");
          }}
        />

        {/* Notifications Drawer */}
        <NotificationModal
          visible={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
        />

        {/* Auth Bottom Drawer Modal */}
        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </BlurTargetContext>
    </SafeAreaView>
  );
}
