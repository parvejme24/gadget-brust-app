export const DEFAULT_STORE_SETTINGS = {
  storeName: "Gadget Brust",
  tagline: "Smart gadgets, genuine warranty",
  currency: "৳",
};

export const PROMO_BANNERS = [
  {
    id: "banner-1",
    tag: "MEGA DEAL",
    title: "Apple MacBook Pro M3",
    subtitle: "Up to ৳12,000 off on Apple silicon",
    badge: "Limited Stock",
    bgGradient: ["#10b981", "#059669"],
    accent: "#38ad81",
  },
  {
    id: "banner-2",
    tag: "NEW ARRIVAL",
    title: "Flagship Phones Fest",
    subtitle: "Official warranty with 0% EMI",
    badge: "Official Stock",
    bgGradient: ["#3b82f6", "#1d4ed8"],
    accent: "#2563eb",
  },
  {
    id: "banner-3",
    tag: "AUDIO FEST",
    title: "Wireless ANC Audio",
    subtitle: "Sony & Apple earbuds from ৳3,499",
    badge: "Hot Deal",
    bgGradient: ["#8b5cf6", "#6d28d9"],
    accent: "#7c3aed",
  },
];

export const CATEGORIES = [
  { id: "all", name: "All", icon: "LayoutGrid" },
  { id: "laptop", name: "Laptops", icon: "Laptop" },
  { id: "phone", name: "Phones", icon: "Smartphone" },
  { id: "tablet", name: "Tablets", icon: "Tablet" },
  { id: "audio", name: "Audio", icon: "Headphones" },
  { id: "watch", name: "Watches", icon: "Watch" },
];

export const TRUST_PERKS = [
  { icon: "ShieldCheck", label: "100% Genuine", desc: "Official Warranty" },
  { icon: "Zap", label: "Fast Express", desc: "Same-Day Dispatch" },
  { icon: "RotateCcw", label: "7-Day Return", desc: "Hassle-Free" },
];

export const FALLBACK_PRODUCTS = [
  {
    _id: "static-1",
    title: "Apple MacBook Pro 14\" M3 Space Grey",
    price: 229000,
    discount: 5,
    discountPrice: 217550,
    star: 4.9,
    image: {
      url: "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/1.webp",
    },
  },
  {
    _id: "static-2",
    title: "Asus Zenbook Pro Duo 14 OLED",
    price: 185000,
    discount: 10,
    discountPrice: 166500,
    star: 4.8,
    image: {
      url: "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-oled/1.webp",
    },
  },
  {
    _id: "static-3",
    title: "iPhone 15 Pro Max 256GB Natural Titanium",
    price: 155000,
    discount: 8,
    discountPrice: 142600,
    star: 4.9,
    image: {
      url: "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/1.webp",
    },
  },
  {
    _id: "static-4",
    title: "Huawei MateBook X Pro 2024",
    price: 165000,
    discount: 8,
    discountPrice: 151800,
    star: 4.7,
    image: {
      url: "https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/1.webp",
    },
  },
  {
    _id: "static-5",
    title: "Sony WH-1000XM5 Wireless Headphones",
    price: 38000,
    discount: 12,
    discountPrice: 33440,
    star: 4.9,
    image: {
      url: "https://placehold.co/600x600/f3f4ef/2d8f6a/png?font=montserrat&text=Sony+WH-1000XM5",
    },
  },
  {
    _id: "static-6",
    title: "Samsung Galaxy Watch 6 Classic",
    price: 28500,
    discount: 15,
    discountPrice: 24225,
    star: 4.6,
    image: {
      url: "https://placehold.co/600x600/f3f4ef/2d8f6a/png?font=montserrat&text=Galaxy+Watch+6",
    },
  },
];
