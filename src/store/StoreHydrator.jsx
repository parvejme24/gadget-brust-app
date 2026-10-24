import { useEffect } from "react";
import { useStore } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tokenStorage } from "@/lib/tokenStorage";
import { setSessionExpiredHandler } from "@/lib/api";
import { hydrateShop } from "./slices/shopSlice";
import { sessionRestored, signedOut } from "./slices/authSlice";

const SHOP_KEY = "gadgetBrustShop";

// restores the session and the device cart/wishlist on launch, then keeps the cart saved
export default function StoreHydrator() {
  const store = useStore();

  useEffect(() => {
    setSessionExpiredHandler(() => store.dispatch(signedOut()));
    tokenStorage.readUser().then((user) => store.dispatch(sessionRestored(user)));
    AsyncStorage.getItem(SHOP_KEY)
      .then((raw) => store.dispatch(hydrateShop(raw ? JSON.parse(raw) : null)))
      .catch(() => store.dispatch(hydrateShop(null)));

    let last = null;
    return store.subscribe(() => {
      const { cart, wishlist, hydrated } = store.getState().shop;
      if (!hydrated) return;
      const next = JSON.stringify({ cart, wishlist });
      if (next === last) return;
      last = next;
      AsyncStorage.setItem(SHOP_KEY, next).catch(() => {});
    });
  }, [store]);

  return null;
}
