import { createSlice } from "@reduxjs/toolkit";

// device cart and wishlist (guests can shop without an account); persisted with AsyncStorage
const shopSlice = createSlice({
  name: "shop",
  initialState: { cart: [], wishlist: [], hydrated: false },
  reducers: {
    hydrateShop: (state, action) => {
      state.cart = action.payload?.cart || [];
      state.wishlist = action.payload?.wishlist || [];
      state.hydrated = true;
    },
    addToCart: (state, action) => {
      const { product, qty = 1 } = action.payload;
      const line = state.cart.find((i) => i._id === product._id);
      if (line) line.qty = Math.min(line.qty + qty, product.stock || 99);
      else state.cart.push({ ...product, qty });
    },
    updateCartQty: (state, action) => {
      const line = state.cart.find((i) => i._id === action.payload.id);
      if (line) line.qty = Math.max(1, action.payload.qty);
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((i) => i._id !== action.payload);
    },
    clearCart: (state) => {
      state.cart = [];
    },
    toggleWishlist: (state, action) => {
      const exists = state.wishlist.some((i) => i._id === action.payload._id);
      state.wishlist = exists ? state.wishlist.filter((i) => i._id !== action.payload._id) : [...state.wishlist, action.payload];
    },
  },
});

export const { hydrateShop, addToCart, updateCartQty, removeFromCart, clearCart, toggleWishlist } = shopSlice.actions;
export default shopSlice.reducer;
