import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Order } from "@/types";
import { getMyOrdersApi } from "@/api/order.api";
import { formatCurrency } from "@/utils/formatCurrency";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/utils/constants";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyOrdersApi().then(({ data }) => {
      setOrders(data.data.orders);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <Loader label="Loading orders" />;

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Once you place an order, it'll show up here."
        action={
          <Link to="/" className="btn-primary">
            Go to shop
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <h1 className="section-title mb-6">Your orders</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Link
            key={o._id}
            to={`/orders/${o._id}`}
            className="flex items-center justify-between rounded border border-line bg-white p-4 hover:border-ink"
          >
            <div>
              <p className="text-sm font-medium text-ink">Order #{o._id.slice(-6)}</p>
              <p className="text-xs text-muted">
                {o.orderItems.length} item{o.orderItems.length > 1 ? "s" : ""} ·{" "}
                {new Date(o.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[o.status]}`}>
                {ORDER_STATUS_LABELS[o.status]}
              </span>
              <span className="text-sm font-medium text-ink">{formatCurrency(o.totalPrice)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
