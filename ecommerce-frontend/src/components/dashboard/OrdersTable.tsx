import { Link } from "react-router-dom";
import { Order } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/utils/constants";

export default function OrdersTable({
  orders,
  onDeliver,
}: {
  orders: Order[];
  onDeliver?: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-paper text-left text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => {
            const customer = typeof o.user === "object" ? o.user : null;
            return (
              <tr key={o._id}>
                <td className="px-4 py-3">
                  <Link to={`/orders/${o._id}`} className="font-medium text-forest hover:underline">
                    #{o._id.slice(-6)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{customer?.name || "—"}</td>
                <td className="px-4 py-3 font-medium text-ink">{formatCurrency(o.totalPrice)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[o.status]}`}>
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {onDeliver && !o.isDelivered && (
                    <button onClick={() => onDeliver(o._id)} className="text-sm text-forest hover:underline">
                      Mark delivered
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
