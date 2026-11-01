import { Link } from "react-router-dom";
import { Product } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";
import StarRating from "@/components/common/StarRating";

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block overflow-hidden rounded border border-line bg-white transition-colors hover:border-ink"
    >
      <div className="aspect-square overflow-hidden bg-forest-light">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-forest-dark/40">
            <span className="font-serif text-3xl">{product.name[0]}</span>
          </div>
        )}
      </div>
      <div className="space-y-1.5 p-4">
        <p className="line-clamp-1 text-sm font-medium text-ink">{product.name}</p>
        <StarRating value={product.ratings} count={product.numReviews} />
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-lg text-ink">
            {formatCurrency(hasDiscount ? product.discountPrice! : product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted line-through">{formatCurrency(product.price)}</span>
          )}
        </div>
        {product.stock === 0 && <p className="text-xs font-medium text-red-700">Out of stock</p>}
      </div>
    </Link>
  );
}
