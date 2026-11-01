import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { createOrderApi } from "@/api/order.api";
import { formatCurrency } from "@/utils/formatCurrency";

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({ street: "", city: "", state: "", zip: "", country: "" });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart?.items.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + tax + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { data } = await createOrderApi(address, paymentMethod);
      await refreshCart();
      navigate(`/orders/${data.data.order._id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return <p className="text-sm text-muted">Your cart is empty — nothing to check out.</p>;
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <form onSubmit={handleSubmit} className="space-y-4 md:col-span-2">
        <h1 className="section-title mb-2">Shipping details</h1>

        <div>
          <label className="label">Street</label>
          <input
            required
            className="input"
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">City</label>
            <input
              required
              className="input"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
          </div>
          <div>
            <label className="label">State</label>
            <input
              required
              className="input"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
            />
          </div>
          <div>
            <label className="label">ZIP</label>
            <input
              required
              className="input"
              value={address.zip}
              onChange={(e) => setAddress({ ...address, zip: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Country</label>
            <input
              required
              className="input"
              value={address.country}
              onChange={(e) => setAddress({ ...address, country: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">Payment method</label>
          <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="COD">Cash on delivery</option>
            <option value="Card">Card (demo)</option>
            <option value="UPI">UPI (demo)</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Placing order…" : "Place order"}
        </button>
      </form>

      <div className="card h-fit p-5">
        <h2 className="mb-4 font-serif text-lg text-ink">Order total</h2>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Tax</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-1.5 font-medium text-ink">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
