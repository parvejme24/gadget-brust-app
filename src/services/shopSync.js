import api from "@/lib/api";

// Signed-in users keep their cart and wishlist on the server, so they match the website and other devices.
// The device copy (Redux + AsyncStorage) stays the source for the screens; these calls keep the server in step.

const fromCartLine = (line) => ({ ...line.product_id, qty: line.qty });

const cartBody = (cart) => ({ items: cart.map((i) => ({ product_id: i._id, qty: i.qty || 1 })) });
const wishlistBody = (wishlist) => ({ productIDs: wishlist.map((i) => i._id) });

export const shopSync = {
  // after sign-in: merge the guest cart/wishlist into the saved ones and return the merged lists
  merge: async ({ cart = [], wishlist = [] }) => {
    const [c, w] = await Promise.all([api.post("/cart/sync", cartBody(cart)), api.post("/wishlist/sync", wishlistBody(wishlist))]);
    return {
      cart: (c.data?.data?.cartItems || []).map(fromCartLine),
      wishlist: (w.data?.data?.items || []).map((row) => row.productID),
    };
  },

  // after a change while signed in: save the whole list
  saveCart: (cart) => api.put("/cart/me", cartBody(cart)),
  saveWishlist: (wishlist) => api.put("/wishlist/me", wishlistBody(wishlist)),
};
