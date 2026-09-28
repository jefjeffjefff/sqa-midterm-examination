import type { OrderStatus } from "../types";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  Draft: ["Pending", "Cancelled"],
  Pending: ["Paid", "Cancelled"],
  Paid: ["Refunded", "Shipped"],
  Refunded: [],
  Cancelled: ["Paid"],
  Shipped: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return transitions[from].includes(to);
}

export function canRefund(status: OrderStatus): boolean {
  return status !== "Draft";
}
