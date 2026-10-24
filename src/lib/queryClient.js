import { QueryClient } from "@tanstack/react-query";

// don't retry 4xx responses: they won't succeed on a second try
const retry = (max) => (failureCount, error) => {
  const status = error?.response?.status;
  if (status >= 400 && status < 500) return false;
  return failureCount < max;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, retry: retry(2) },
    mutations: { retry: retry(1) },
  },
});
