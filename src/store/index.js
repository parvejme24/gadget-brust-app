import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import shopReducer from "./slices/shopSlice";

// client state only; server data lives in TanStack Query
export const store = configureStore({
  reducer: { auth: authReducer, shop: shopReducer },
});
