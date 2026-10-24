import { useQuery } from "@tanstack/react-query";
import { storefrontService as api } from "@/services/storefrontService";

const MIN = 60 * 1000;

export const useProducts = (params = {}) =>
  useQuery({
    queryKey: ["products", params],
    queryFn: () => api.products(params),
    staleTime: 2 * MIN,
  });

export const useDiscountedProducts = () =>
  useQuery({
    queryKey: ["products", "discounted"],
    queryFn: api.discountedProducts,
    staleTime: 5 * MIN,
  });

export const useSliderProducts = () =>
  useQuery({
    queryKey: ["products", "slider"],
    queryFn: api.sliderProducts,
    staleTime: 5 * MIN,
  });

export const useNewestProducts = () =>
  useQuery({
    queryKey: ["products", "newest"],
    queryFn: api.newestProducts,
    staleTime: 5 * MIN,
  });

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: api.categories,
    staleTime: 10 * MIN,
  });

export const useBrands = () =>
  useQuery({
    queryKey: ["brands"],
    queryFn: api.brands,
    staleTime: 10 * MIN,
  });

export const useStoreSettings = () =>
  useQuery({
    queryKey: ["store-settings"],
    queryFn: api.settings,
    staleTime: 10 * MIN,
  });

export const useProductById = (id) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: () => api.productById(id),
    enabled: !!id,
    staleTime: 5 * MIN,
  });

export const useProductReviews = (productId) =>
  useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => api.productReviews(productId),
    enabled: !!productId,
    staleTime: 5 * MIN,
  });

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: api.notifications,
    staleTime: 2 * MIN,
    retry: 1,
  });

export const useMyOrders = (enabled = true) =>
  useQuery({
    queryKey: ["my-orders"],
    queryFn: api.myOrders,
    enabled: !!enabled,
    staleTime: 2 * MIN,
    retry: 1,
  });
