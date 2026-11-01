import { CartItem } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";

export default function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const product = typeof item.product === "object" ? item.product : null;
  if (!product) return null;

  return (
    <div className="flex items-center gap-4 border-b border-line py-4 last:border-0">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-forest-light">
        {product.images?.[0] && (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{product.name}</p>
        <p className="text-sm text-muted">{formatCurrency(item.price)} each</p>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor={`qty-${product._id}`} className="sr-only">
          Quantity
        </label>
        <input
          id={`qty-${product._id}`}
          type="number"
          min={1}
          max={product.stock}
          value={item.quantity}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
          className="input w-16 text-center"
        />
      </div>

      <p className="w-20 text-right text-sm font-medium text-ink">
        {formatCurrency(item.price * item.quantity)}
      </p>

      <button onClick={onRemove} className="text-sm text-red-700 hover:underline">
        Remove
      </button>
    </div>
  );
}
