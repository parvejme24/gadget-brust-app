import { useEffect } from "react";
import { useStore } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tokenStorage } from "@/lib/tokenStorage";
import { setSessionExpiredHandler } from "@/lib/api";
import { shopSync } from "@/services/shopSync";
import { hydrateShop } from "./slices/shopSlice";
import { sessionRestored, signedOut } from "./slices/authSlice";

const SHOP_KEY = "gadgetBrustShop";
const SAVE_DELAY_MS = 600;

// Restores the session and the device cart/wishlist on launch, then keeps the cart/wishlist saved:
// on the device always, and on the server while signed in (merged at sign-in, cleared on the device at sign-out).
export default function StoreHydrator() {
  const store = useStore();

  useEffect(() => {
    setSessionExpiredHandler(() => store.dispatch(signedOut()));
    tokenStorage.readUser().then((user) => store.dispatch(sessionRestored(user)));
    AsyncStorage.getItem(SHOP_KEY)
      .then((raw) => store.dispatch(hydrateShop(raw ? JSON.parse(raw) : null)))
      .catch(() => store.dispatch(hydrateShop(null)));

    let last = null;
    let userId = null;
    let merging = false;
    let saved = { cart: null, wishlist: null }; // what the server has, as JSON
    let saveTimer = null;

    const snapshot = () => {
      const { cart, wishlist } = store.getState().shop;
      return { cart: JSON.stringify(cart.map((i) => [i._id, i.qty])), wishlist: JSON.stringify(wishlist.map((i) => i._id)) };
    };

    const merge = async () => {
      merging = true;
      try {
        const { cart, wishlist } = store.getState().shop;
        store.dispatch(hydrateShop(await shopSync.merge({ cart, wishlist })));
        saved = snapshot();
      } catch {
        // offline or session expired: keep the device copy, it is merged on the next sign-in
      } finally {
        merging = false;
      }
    };

    const saveChanges = () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        if (!userId || merging) return;
        const now = snapshot();
        const { cart, wishlist } = store.getState().shop;
        if (now.cart !== saved.cart) shopSync.saveCart(cart).then(() => (saved.cart = now.cart)).catch(() => {});
        if (now.wishlist !== saved.wishlist) shopSync.saveWishlist(wishlist).then(() => (saved.wishlist = now.wishlist)).catch(() => {});
      }, SAVE_DELAY_MS);
    };

    const unsubscribe = store.subscribe(() => {
      const { shop, auth } = store.getState();
      // wait until both the session and the device cart are restored
      if (!shop.hydrated || !auth.ready) return;

      const nextUserId = auth.user?._id || null;
      if (nextUserId !== userId) {
        const wasSignedIn = !!userId;
        userId = nextUserId;
        saved = { cart: null, wishlist: null };
        if (wasSignedIn && !userId) store.dispatch(hydrateShop(null)); // the next shopper on this device starts empty
        else if (userId) merge();
      } else if (userId && !merging) {
        saveChanges();
      }

      const next = JSON.stringify({ cart: shop.cart, wishlist: shop.wishlist });
      if (next === last) return;
      last = next;
      AsyncStorage.setItem(SHOP_KEY, next).catch(() => {});
    });

    return () => {
      unsubscribe();
      clearTimeout(saveTimer);
    };
  }, [store]);

  return null;
}
