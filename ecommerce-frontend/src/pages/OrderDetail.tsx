import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Order } from "@/types";
import { getOrderByIdApi, payOrderApi } from "@/api/order.api";
import { formatCurrency } from "@/utils/formatCurrency";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/utils/constants";
import Loader from "@/components/common/Loader";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    if (!id) return;
    getOrderByIdApi(id).then(({ data }) => {
      setOrder(data.data.order);
      setIsLoading(false);
    });
  };

  useEffect(load, [id]);

  if (isLoading) return <Loader label="Loading order" />;
  if (!order) return <p className="text-sm text-muted">Order not found.</p>;

  const handlePay = async () => {
    if (!id) return;
    await payOrderApi(id);
    load();
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="section-title">Order #{order._id.slice(-6)}</h1>
          <span className={`rounded px-2 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>

        <div className="divide-y divide-line rounded border border-line bg-white px-4">
          {order.orderItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-ink">{item.name}</p>
                <p className="text-xs text-muted">
                  {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>
              <p className="text-sm font-medium text-ink">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded border border-line bg-white p-4">
          <h2 className="mb-2 font-serif text-lg text-ink">Shipping address</h2>
          <p className="text-sm text-muted">
            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.zip}, {order.shippingAddress.country}
          </p>
        </div>
      </div>

      <div className="card h-fit p-5">
        <h2 className="mb-4 font-serif text-lg text-ink">Payment summary</h2>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted">
            <span>Items</span>
            <span>{formatCurrency(order.itemsPrice)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Tax</span>
            <span>{formatCurrency(order.taxPrice)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Shipping</span>
            <span>{formatCurrency(order.shippingPrice)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-1.5 font-medium text-ink">
            <span>Total</span>
            <span>{formatCurrency(order.totalPrice)}</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted">Payment method: {order.paymentMethod}</p>

        {!order.isPaid ? (
          <button onClick={handlePay} className="btn-primary mt-4 w-full">
            Mark as paid (demo)
          </button>
        ) : (
          <p className="mt-4 text-sm font-medium text-forest">Paid</p>
        )}
      </div>
    </div>
  );
}
