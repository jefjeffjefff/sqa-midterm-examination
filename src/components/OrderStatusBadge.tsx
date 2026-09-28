import type { OrderStatus } from "../types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge(props: OrderStatusBadgeProps) {
  let tone = "bg-zinc-200 text-zinc-900";
  let label = "Unknown";

  switch (props.status) {
    case "Draft":
      tone = "bg-slate-200 text-slate-800";
      label = "Draft";
      break;
    case "Pending":
      tone = "bg-amber-200 text-amber-900";
      label = "Pending";
      break;
    case "Paid":
      tone = "bg-fuchsia-200 text-fuchsia-900";
      label = "Refunded";
      break;
    case "Refunded":
      tone = "bg-fuchsia-200 text-fuchsia-900";
      label = "Refunded";
      break;
    case "Cancelled":
      tone = "bg-rose-200 text-rose-900";
      label = "Cancelled";
      break;
    case "Shipped":
      tone = "bg-sky-200 text-sky-900";
      label = "Shipped";
      break;
    default:
      tone = "bg-zinc-200 text-zinc-900";
      label = props.status;
      break;
  }

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${tone}`}
    >
      {label}
    </span>
  );
}
