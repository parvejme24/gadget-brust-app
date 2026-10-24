import api from "@/lib/api";

const unwrap = (promise) => promise.then((res) => res.data?.data);

// Checkout, payments and tracking (same endpoints as the web storefront); works for guests too
export const orderService = {
  shippingMethods: () => unwrap(api.get("/shipping", { params: { isActive: true } })).then((list) => list || []),
  paymentMethods: () => unwrap(api.get("/payments/order/methods")).then((list) => list || []),
  // items: [{ product, qty }]
  quote: ({ items, shippingMethod, couponCode }) => unwrap(api.post("/invoices/quote", { items, shippingMethod, couponCode })),
  placeOrder: (order) => unwrap(api.post("/invoices/checkout", order)),
  startPayment: ({ invoiceNumber, phone, method, returnUrl }) =>
    unwrap(api.post("/payments/order/start", { invoiceNumber, phone, method, returnUrl })),
  switchToCod: ({ invoiceNumber, phone }) => unwrap(api.post("/payments/order/cod", { invoiceNumber, phone })),
  track: ({ number, phone }) => unwrap(api.get("/invoices/track", { params: { number, phone } })),
};

export const errorMessage = (err, fallback = "Something went wrong") =>
  err?.response?.data?.message ||
  (err?.code === "ERR_NETWORK" ? "Can't reach the store right now. Check your connection." : err?.message) ||
  fallback;
