import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import CartItemRow from "@/components/cart/CartItemRow";
import EmptyState from "@/components/common/EmptyState";
import Loader from "@/components/common/Loader";
import { formatCurrency } from "@/utils/formatCurrency";

export default function Cart() {
  const { cart, isLoading, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (isLoading) return <Loader label="Loading cart" />;

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse the catalogue and add something you like."
        action={
          <Link to="/" className="btn-primary">
            Go to shop
          </Link>
        }
      />
    );
  }

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <h1 className="section-title mb-4">Your cart</h1>
        <div className="rounded border border-line bg-white px-4">
          {cart.items.map((item) => {
            const productId = typeof item.product === "object" ? item.product._id : item.product;
            return (
              <CartItemRow
                key={productId}
                item={item}
                onQuantityChange={(q) => updateItem(productId, q)}
                onRemove={() => removeItem(productId)}
              />
            );
          })}
        </div>
      </div>

      <div className="card h-fit p-5">
        <h2 className="mb-4 font-serif text-lg text-ink">Order summary</h2>
        <div className="flex justify-between text-sm text-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-muted">Tax and shipping calculated at checkout.</p>
        <button onClick={() => navigate("/checkout")} className="btn-primary mt-4 w-full">
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
