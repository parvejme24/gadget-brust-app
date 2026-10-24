import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import { Check, Heart, LayoutGrid, Rows3, ShoppingBag } from "lucide-react-native";
import ErrorState from "./ErrorState";
import ProductCard from "./ProductCard";
import ScreenHeader from "./ScreenHeader";
import { NAV_SPACE } from "./BottomNav";
import { addToCart, toggleWishlist } from "@/store/slices/shopSlice";
import { formatTaka, getFinalPrice } from "@/lib/format";
import tw from "@/lib/tw";
import { colors } from "@/theme";

const TINTS = ["#e8f7f1", "#eaf1ff", "#f4ecff", "#fff4e0", "#ffecf3", "#e6f7fb"];
const PRICE_COL = 82;
const ACTION_COL = 74;

const VIEW_MODES = [
  { id: "table", label: "Table", icon: Rows3 },
  { id: "grid", label: "Grid", icon: LayoutGrid },
];

function stockInfo(stock) {
  if (stock === 0) return { label: "Out of stock", color: colors.gray500, dot: colors.gray400 };
  if (typeof stock === "number" && stock <= 5) return { label: `Only ${stock} left`, color: "#b45309", dot: colors.amber500 };
  return { label: "In stock", color: colors.brandDark, dot: colors.brand };
}

function TableRow({ item, index, inCart, isLast, onOpen, onAddToCart, onRemove }) {
  const price = getFinalPrice(item);
  const brandName = typeof item.brand === "object" ? item.brand?.brandName : null;
  const stock = stockInfo(item.stock);
  const outOfStock = item.stock === 0;

  return (
    <Pressable
      onPress={() => onOpen?.(item)}
      style={({ pressed }) => [
        tw("flex-row items-center px-3 py-3 cursor-pointer"),
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.gray50 },
        pressed && { backgroundColor: colors.gray50 },
      ]}
    >
      {/* Product column */}
      <View style={tw("flex-1 flex-row items-center gap-2.5 pr-2")}>
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 14,
            backgroundColor: TINTS[index % TINTS.length],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={item.image?.url}
            style={{ width: "80%", height: "80%", opacity: outOfStock ? 0.45 : 1 }}
            contentFit="contain"
            transition={200}
          />
        </View>
        <View style={tw("flex-1")}>
          {!!brandName && (
            <Text numberOfLines={1} style={[tw("font-extrabold text-brand-dark"), { fontSize: 9, letterSpacing: 0.6 }]}>
              {brandName.toUpperCase()}
            </Text>
          )}
          <Text numberOfLines={2} style={[tw("text-xs font-bold text-gray-900"), { lineHeight: 15 }]}>
            {item.title}
          </Text>
          <View style={tw("flex-row items-center gap-1 mt-1")}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: stock.dot }} />
            <Text style={[tw("font-semibold"), { fontSize: 10, color: stock.color }]}>{stock.label}</Text>
          </View>
        </View>
      </View>

      {/* Price column */}
      <View style={{ width: PRICE_COL, alignItems: "flex-end", paddingRight: 8 }}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={[tw("font-black text-gray-900"), { fontSize: 13 }]}>
          {formatTaka(price)}
        </Text>
        {price < item.price && (
          <Text numberOfLines={1} style={[tw("text-gray-400 font-medium"), { fontSize: 10, textDecorationLine: "line-through" }]}>
            {formatTaka(item.price)}
          </Text>
        )}
        {item.discount > 0 && (
          <Text style={[tw("font-black"), { fontSize: 10, color: colors.red500 }]}>-{item.discount}%</Text>
        )}
      </View>

      {/* Action column */}
      <View style={{ width: ACTION_COL, flexDirection: "row", justifyContent: "flex-end", gap: 6 }}>
        <Pressable
          onPress={(e) => {
            e?.stopPropagation?.();
            if (!inCart && !outOfStock) onAddToCart(item);
          }}
          disabled={inCart || outOfStock}
          hitSlop={4}
          style={({ pressed }) => [
            tw("items-center justify-center rounded-xl cursor-pointer"),
            {
              width: 32,
              height: 32,
              backgroundColor: outOfStock ? colors.gray100 : inCart ? colors.brandLight : colors.brand,
              borderWidth: inCart ? 1 : 0,
              borderColor: "#bfe8d6",
            },
            pressed && { transform: [{ scale: 0.88 }] },
          ]}
        >
          {inCart ? (
            <Check size={15} color={colors.brandDark} strokeWidth={3} />
          ) : (
            <ShoppingBag size={14} color={outOfStock ? colors.gray400 : "#fff"} strokeWidth={2.4} />
          )}
        </Pressable>
        <Pressable
          onPress={(e) => {
            e?.stopPropagation?.();
            onRemove(item);
          }}
          hitSlop={4}
          style={({ pressed }) => [
            tw("items-center justify-center rounded-xl cursor-pointer"),
            { width: 32, height: 32, backgroundColor: "#fee2e2" },
            pressed && { transform: [{ scale: 0.88 }] },
          ]}
        >
          <Heart size={14} color={colors.red500} fill={colors.red500} strokeWidth={2.2} />
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function WishlistView({ onExplore, onOpenDetail }) {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.shop?.wishlist || []);
  const cart = useSelector((s) => s.shop?.cart || []);
  const [viewMode, setViewMode] = useState("table");

  const isInCart = (id) => cart.some((c) => c._id === id);
  // Only items that are in stock and not already in the cart can be added in bulk
  const addable = wishlist.filter((p) => p.stock !== 0 && !isInCart(p._id));
  const totalValue = wishlist.reduce((sum, p) => sum + getFinalPrice(p), 0);

  const handleAddToCart = (product) => dispatch(addToCart({ product, qty: 1 }));
  const handleRemove = (product) => dispatch(toggleWishlist(product));
  const handleAddAllToCart = () => addable.forEach(handleAddToCart);

  const toolbar = (
    <View style={tw("flex-row items-center justify-between px-4 pb-3")}>
      <Text style={tw("text-sm font-extrabold text-gray-900")}>
        {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
      </Text>
      <View style={[tw("flex-row rounded-xl"), { padding: 3, backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder }]}>
        {VIEW_MODES.map(({ id, label, icon: Icon }) => {
          const active = viewMode === id;
          return (
            <Pressable
              key={id}
              onPress={() => setViewMode(id)}
              style={[
                tw("flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer"),
                active && { backgroundColor: colors.gray900 },
              ]}
            >
              <Icon size={13} color={active ? "#fff" : colors.gray500} strokeWidth={2.4} />
              <Text style={[tw("text-xs font-bold"), { color: active ? "#fff" : colors.gray500 }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={tw("flex-1 bg-canvas")}>
      <ScreenHeader
        id="wishlist-hero"
        title="My Wishlist"
        subtitle={
          wishlist.length > 0
            ? `${wishlist.length} saved ${wishlist.length === 1 ? "gadget" : "gadgets"} · worth ${formatTaka(totalValue)}`
            : "Save gadgets you love for later"
        }
        actionLabel={`Add all (${addable.length})`}
        actionIcon={ShoppingBag}
        onAction={addable.length > 0 ? handleAddAllToCart : undefined}
      />

      {wishlist.length === 0 ? (
        <View style={tw("flex-1 items-center justify-center p-6")}>
          <ErrorState type="empty-wishlist" onAction={onExplore} />
        </View>
      ) : viewMode === "table" ? (
        <FlatList
          key="table"
          data={wishlist}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: NAV_SPACE }}
          ListHeaderComponent={
            <>
              {toolbar}
              {/* Table column headings */}
              <View
                style={[
                  tw("flex-row items-center mx-4 px-3 py-2.5 glass-strong rounded-t-2xl"),
                  { borderBottomWidth: 0, backgroundColor: colors.gray50 },
                ]}
              >
                <Text style={[tw("flex-1 font-extrabold text-gray-500"), { fontSize: 10, letterSpacing: 0.8 }]}>PRODUCT</Text>
                <Text style={[tw("font-extrabold text-gray-500 text-right"), { width: PRICE_COL, paddingRight: 8, fontSize: 10, letterSpacing: 0.8 }]}>
                  PRICE
                </Text>
                <Text style={[tw("font-extrabold text-gray-500 text-right"), { width: ACTION_COL, fontSize: 10, letterSpacing: 0.8 }]}>
                  ACTION
                </Text>
              </View>
            </>
          }
          renderItem={({ item, index }) => (
            <View
              style={[
                tw("mx-4 bg-surface"),
                { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.glassBorder },
                index === wishlist.length - 1 && { borderBottomWidth: 1, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, overflow: "hidden" },
              ]}
            >
              <TableRow
                item={item}
                index={index}
                inCart={isInCart(item._id)}
                isLast={index === wishlist.length - 1}
                onOpen={onOpenDetail}
                onAddToCart={handleAddToCart}
                onRemove={handleRemove}
              />
            </View>
          )}
          ListFooterComponent={
            <View style={tw("mx-4 mt-3 flex-row items-center justify-between px-1")}>
              <Text style={[tw("text-gray-500 font-medium"), { fontSize: 11 }]}>Total wishlist value</Text>
              <Text style={tw("text-sm font-black text-gray-900")}>{formatTaka(totalValue)}</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          key="grid"
          data={wishlist}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: NAV_SPACE }}
          columnWrapperStyle={tw("justify-between px-2.5")}
          ListHeaderComponent={toolbar}
          renderItem={({ item, index }) => <ProductCard product={item} index={index} onOpenDetail={onOpenDetail} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
