// Customer-facing wording for order and payment states (mirrors the web storefront)
export const ORDER_STEPS = [
  { id: "pending", label: "Placed", desc: "We've received your order" },
  { id: "processing", label: "Accepted", desc: "Your order is being packed" },
  { id: "shipped", label: "Shipped", desc: "Handed to the courier" },
  { id: "delivered", label: "Delivered", desc: "Enjoy your gadget!" },
];

export const ORDER_STATUS = {
  pending: { label: "Order placed", color: "#b45309", bg: "#fef3c7" },
  processing: { label: "Accepted", color: "#1d4ed8", bg: "#dbeafe" },
  shipped: { label: "On the way", color: "#6d28d9", bg: "#ede9fe" },
  delivered: { label: "Delivered", color: "#047857", bg: "#d1fae5" },
  cancelled: { label: "Cancelled", color: "#b91c1c", bg: "#fee2e2" },
};

export const PAYMENT_LABELS = {
  cash_on_delivery: "Cash on Delivery",
  ssl_commerz: "SSLCommerz",
  stripe: "Card (Stripe)",
  shurjopay: "ShurjoPay",
  bkash: "bKash",
  nagad: "Nagad",
  cash: "Cash",
  card: "Card",
};

export const ONLINE_METHODS = ["ssl_commerz", "stripe"];

export const isPaid = (order) => order?.paymentStatus === "completed";

// An online order that hasn't been paid yet (and can still be)
export const awaitsOnlinePayment = (order) =>
  !!order && ONLINE_METHODS.includes(order.paymentMethod) && !isPaid(order) && order.orderStatus !== "cancelled";

export const formatDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
};
