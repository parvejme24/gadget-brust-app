// same helpers as the web app's lib/format.js
export const formatTaka = (amount) => `৳${Math.round(Number(amount) || 0).toLocaleString("en-IN")}`;

export const getFinalPrice = (product) => {
  if (product?.discountPrice && product.discountPrice < product.price) return product.discountPrice;
  if (product?.discount > 0) return product.price - (product.price * product.discount) / 100;
  return product?.price || 0;
};
