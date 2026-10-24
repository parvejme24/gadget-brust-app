import api from "@/lib/api";

const productList = (promise) =>
  promise.then((res) => res.data?.data?.products || res.data?.data || []);

// Storefront data service connected to backend REST APIs
export const storefrontService = {
  products: (params) =>
    api
      .get("/products", { params })
      .then((res) => res.data?.data?.products || res.data?.data || []),
  discountedProducts: () => productList(api.get("/products/discounted")),
  sliderProducts: () => productList(api.get("/products/slider")),
  newestProducts: () => productList(api.get("/products/newest")),
  categories: () => api.get("/categories").then((res) => res.data?.data || []),
  brands: () => api.get("/brands").then((res) => res.data?.data || []),
  settings: () => api.get("/store-settings").then((res) => res.data?.data || {}),
  sendContactMessage: (message) => api.post("/contact", message).then((res) => res.data?.data),
  productsByCategory: (categoryId) => productList(api.get(`/products/category/${categoryId}`)),
  productsByBrand: (brandId) => productList(api.get(`/products/brand/${brandId}`)),
  productById: (id) => api.get(`/products/${id}`).then((res) => res.data?.data || res.data),
  searchProducts: (query) =>
    api
      .get("/products/search", { params: { q: query, search: query } })
      .then((res) => res.data?.data?.products || res.data?.data || []),
  notifications: () =>
    api
      .get("/notifications")
      .then((res) => res.data?.data?.items || res.data?.data || []),
  myOrders: () =>
    api
      .get("/invoices/mine")
      .then((res) => (Array.isArray(res.data?.data) ? res.data?.data : res.data?.data?.invoices || [])),
  productReviews: (productId) => api.get(`/reviews/product/${productId}`).then((res) => res.data?.data || []),
  quoteOrder: (payload) => api.post("/invoices/quote", payload).then((res) => res.data?.data || res.data),
  createOrder: (payload) => api.post("/invoices/checkout", payload).then((res) => res.data?.data || res.data),
};
