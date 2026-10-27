// One-tap demo logins, same accounts as the website login page
// (created by `npm run seed` in gadget-brust-server)
export const demoAccounts = [
  { role: "admin", label: "Admin", description: "Full dashboard access", email: "admin@gadgetbrust.com", password: "Admin@123" },
  { role: "manager", label: "Manager", description: "Runs daily operations", email: "manager@gadgetbrust.com", password: "Manager@123" },
  { role: "cashier", label: "Cashier", description: "POS and orders", email: "cashier@gadgetbrust.com", password: "Cashier@123" },
  { role: "inventory", label: "Store keeper", description: "Stock and catalog", email: "store@gadgetbrust.com", password: "Store@123" },
  { role: "marketing", label: "Marketing", description: "Coupons and reports", email: "marketing@gadgetbrust.com", password: "Marketing@123" },
  { role: "user", label: "Customer", description: "Shop, wishlist & profile", email: "rahim@example.com", password: "User@123" },
];
