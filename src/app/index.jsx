import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Flame,
  Laptop,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  WifiOff,
} from "lucide-react-native";
import {
  useBrands,
  useCategories,
  useDiscountedProducts,
} from "@/hooks/useStorefront";
import ProductCard from "@/components/ProductCard";
import PromoBanner from "@/components/PromoBanner";
import BottomNav from "@/components/BottomNav";
import ExploreView from "@/components/ExploreView";
import WishlistView from "@/components/WishlistView";
import CartView from "@/components/CartView";
import AccountView from "@/components/AccountView";
import NotificationModal from "@/components/NotificationModal";
import AuthModal from "@/components/AuthModal";
import ProductDetailModal from "@/components/ProductDetailModal";
import GadgetLogo from "@/components/GadgetLogo";
import ProductGridSkeleton from "@/components/ProductSkeleton";
import ErrorState from "@/components/ErrorState";
import tw from "@/lib/tw";
import { colors } from "@/theme";

export default function AppEntry() {
  const { data: liveProducts = [], isLoading: loadingProducts, isError: errorProducts, refetch, isRefetching } = useDiscountedProducts();
  const { data: liveCategories = [] } = useCategories();
  const { data: liveBrands = [] } = useBrands();

  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("all");
  const [selectedFilterBrand, setSelectedFilterBrand] = useState("all");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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
      {/* Top Bar with Real Official Vector Logo & Notification Bell */}
      <View style={tw("flex-row items-center justify-between px-4 pt-2 pb-3")}>
        <View style={tw("flex-row items-center gap-2.5")}>
          <GadgetLogo width={118} height={42} />
          <View style={tw("bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100")}>
            <Text style={tw("text-[10px] font-black text-brand tracking-wider")}>OFFICIAL</Text>
          </View>
        </View>

        {/* Bell Button with Red Unread Dot Badge */}
        <Pressable
          onPress={() => setShowNotificationModal(true)}
          style={({ pressed }) => [
            tw("w-11 h-11 rounded-2xl bg-surface border border-gray-100 items-center justify-center relative shadow-sm cursor-pointer"),
            pressed && { transform: [{ scale: 0.92 }] },
          ]}
        >
          <Bell size={21} color={colors.gray800} strokeWidth={2} />
          <View style={tw("absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white")} />
        </Pressable>
      </View>

      {/* Spacious 48px Height Search Bar & Filter Button */}
      <View style={tw("flex-row items-center gap-2.5 px-4 mb-2")}>
        <View style={tw("flex-1 flex-row items-center gap-3 bg-surface px-4 h-12 rounded-2xl border border-gray-100 shadow-sm")}>
          <Search size={19} color={colors.gray400} />
          <TextInput
            placeholder="Search laptops, smartphones, earbuds..."
            placeholderTextColor={colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={tw("flex-1 text-xs text-gray-900 p-0 font-medium")}
          />
        </View>

        <Pressable
          onPress={() => setActiveTab("explore")}
          style={({ pressed }) => [
            tw("w-12 h-12 rounded-2xl bg-surface border border-gray-100 items-center justify-center shadow-sm cursor-pointer"),
            pressed && { transform: [{ scale: 0.92 }] },
          ]}
        >
          <SlidersHorizontal size={19} color={colors.gray800} />
        </Pressable>
      </View>

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
      <PromoBanner />

      {/* Shop by Category Showcase (Backend Synchronized) */}
      <View style={tw("mt-2 px-4")}>
        <View style={tw("flex-row justify-between items-center mb-2.5")}>
          <Text style={tw("text-sm font-extrabold text-gray-900")}>Shop by Category</Text>
          <Pressable onPress={() => setActiveTab("explore")} style={tw("flex-row items-center gap-0.5 cursor-pointer")}>
            <Text style={tw("text-xs font-bold text-brand")}>See All</Text>
            <ChevronRight size={14} color={colors.brand} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw("gap-3 py-1")}>
          {categoriesList.map((cat, idx) => {
            const image = cat.categoryImg?.url;
            const title = cat.categoryName || cat.label || "Category";
            const FallbackIcon = cat.icon || Laptop;

            return (
              <Pressable
                key={cat._id || cat.id || idx}
                onPress={() => handleSelectCategory(cat)}
                style={({ pressed }) => [
                  tw("items-center w-20 cursor-pointer"),
                  pressed && { transform: [{ scale: 0.92 }] },
                ]}
              >
                <View style={tw("w-14 h-14 rounded-2xl bg-surface items-center justify-center shadow-sm border border-gray-100 mb-1.5 overflow-hidden")}>
                  {image ? (
                    <Image source={image} style={{ width: "70%", height: "70%" }} contentFit="contain" />
                  ) : (
                    <FallbackIcon size={24} color={colors.brand} />
                  )}
                </View>
                <Text numberOfLines={1} style={tw("text-xs font-semibold text-gray-800 text-center")}>
                  {title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Official Brand Stores (Backend Synchronized) */}
      <View style={tw("mt-4 px-4")}>
        <View style={tw("flex-row justify-between items-center mb-2.5")}>
          <Text style={tw("text-sm font-extrabold text-gray-900")}>Official Brand Stores</Text>
          <View style={tw("flex-row items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200")}>
            <ShieldCheck size={12} color={colors.brand} />
            <Text style={tw("text-xs font-bold text-brand-dark")}>100% Genuine</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw("gap-2.5 py-1")}>
          {brandsList.map((brand, idx) => {
            const bImg = typeof brand.brandImg === "string" ? brand.brandImg : brand.brandImg?.url;
            const bName = brand.brandName || "Brand";

            return (
              <Pressable
                key={brand._id || idx}
                onPress={() => handleSelectBrand(brand)}
                style={({ pressed }) => [
                  tw("bg-surface border border-gray-100 px-4 py-2.5 rounded-2xl shadow-sm items-center justify-center cursor-pointer min-w-20"),
                  pressed && { transform: [{ scale: 0.94 }] },
                ]}
              >
                {bImg ? (
                  <Image source={bImg} style={{ width: 44, height: 20 }} contentFit="contain" />
                ) : (
                  <Text style={tw("text-xs font-extrabold text-gray-900")}>{bName}</Text>
                )}
                {brand.badge && (
                  <Text style={tw("text-xs text-gray-400 font-medium mt-0.5")}>{brand.badge}</Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Value Perks Strip */}
      <View style={tw("flex-row justify-between bg-surface mx-4 mt-4 py-3 px-4 rounded-2xl border border-gray-100 shadow-sm")}>
        <View style={tw("flex-row items-center gap-2")}>
          <Truck size={16} color={colors.brand} />
          <View>
            <Text style={tw("text-xs font-bold text-gray-900")}>Fast Delivery</Text>
            <Text style={tw("text-xs text-gray-400")}>All over BD</Text>
          </View>
        </View>

        <View style={tw("w-px h-8 bg-gray-100 self-center")} />

        <View style={tw("flex-row items-center gap-2")}>
          <CreditCard size={16} color="#2563eb" />
          <View>
            <Text style={tw("text-xs font-bold text-gray-900")}>0% EMI</Text>
            <Text style={tw("text-xs text-gray-400")}>Up to 36 Months</Text>
          </View>
        </View>

        <View style={tw("w-px h-8 bg-gray-100 self-center")} />

        <View style={tw("flex-row items-center gap-2")}>
          <ShieldCheck size={16} color="#7c3aed" />
          <View>
            <Text style={tw("text-xs font-bold text-gray-900")}>Official Warranty</Text>
            <Text style={tw("text-xs text-gray-400")}>Guaranteed</Text>
          </View>
        </View>
      </View>

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
      {/* Tab Content */}
      <View style={tw("flex-1")}>
        {activeTab === "home" && (
          <FlatList
            data={loadingProducts && displayProducts.length === 0 ? [] : displayProducts}
            keyExtractor={(p) => p._id}
            numColumns={2}
            contentContainerStyle={tw("pb-24")}
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
            onCheckoutAuthPrompt={() => setShowAuthModal(true)}
          />
        )}

        {activeTab === "profile" && (
          <AccountView
            onOpenWishlist={() => setActiveTab("wishlist")}
            onOpenCart={() => setActiveTab("cart")}
          />
        )}
      </View>

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

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
    </SafeAreaView>
  );
}
