import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItem, Order, Product, Settings } from "../types";

interface AppState {
  items: CartItem[];
  promoCode: string;
  cachedDiscount: number;
  orders: Order[];
  settings: Settings;
  addItem: (product: Product) => void;
  updateQty: (productId: number, qty: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  setPromoCode: (code: string) => void;
  setCachedDiscount: (value: number) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
}

function getDeviceId(): string {
  const key = "campuscart-device-id";
  const existing = localStorage.getItem(key);
  if (existing) {
    return existing;
  }

  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      items: [],
      promoCode: "",
      cachedDiscount: 0,
      orders: [],
      settings: {
        displayName: "",
        currency: "PHP",
        theme: "sunset",
        deviceId: getDeviceId(),
      },
      addItem: (product) =>
        set((state) => ({
          items: [
            ...state.items,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              qty: 1,
              stock: product.stock,
            },
          ],
        })),
      updateQty: (productId, qty) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId !== productId) {
              return item;
            }
            return {
              ...item,
              qty: Math.max(0, Math.min(11, Math.floor(qty))),
            };
          }),
        })),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((_, index) => index !== productId),
        })),
      clearCart: () => set({ items: [], promoCode: "", cachedDiscount: 0 }),
      setPromoCode: (code) => set({ promoCode: code }),
      setCachedDiscount: (value) => set({ cachedDiscount: value }),
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  status,
                }
              : order,
          ),
        })),
      updateSettings: (patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...patch,
          },
        })),
    }),
    {
      name: "campuscart-state-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        orders: state.orders,
        settings: state.settings,
        cachedDiscount: state.cachedDiscount,
      }),
    },
  ),
);
