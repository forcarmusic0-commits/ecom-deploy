import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addReviewApi } from "@/api/product.api";
import { useGetProductQuery } from "@/store/catalogApi";
import { getOrCreateRoomApi } from "@/api/chat.api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/formatCurrency";
import StarRating from "@/components/common/StarRating";
import ReviewList from "@/components/product/ReviewList";
import ReviewForm from "@/components/product/ReviewForm";
import Loader from "@/components/common/Loader";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<string | null>(null);

  const { data: product, isLoading, isError, refetch } = useGetProductQuery(id ?? "", { skip: !id });

  if (isLoading) return <Loader label="Loading product" />;
  if (isError || !product) return <p className="text-sm text-muted">Product not found.</p>;

  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const seller = typeof product.seller === "object" ? product.seller : null;
  const category = typeof product.category === "object" ? product.category : null;
  const reviews = (product.reviews as any[]).filter((r) => typeof r === "object");

  const handleAddToCart = async () => {
    await addItem(product._id, quantity);
    setStatus("Added to cart");
    setTimeout(() => setStatus(null), 2000);
  };

  const handleMessageSeller = async () => {
    if (!seller) return;
    const { data } = await getOrCreateRoomApi(seller._id, product._id);
    navigate("/chat", { state: { roomId: data.data.room.id } });
  };

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <div className="aspect-square overflow-hidden rounded border border-line bg-forest-light">
          {product.images?.[activeImage] ? (
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-forest-dark/40">
              <span className="font-serif text-5xl">{product.name[0]}</span>
            </div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {product.images.map((img, idx) => (
              <button
                key={img}
                onClick={() => setActiveImage(idx)}
                className={`h-16 w-16 overflow-hidden rounded border ${
                  idx === activeImage ? "border-forest" : "border-line"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {category && <p className="text-xs uppercase tracking-wide text-muted">{category.name}</p>}
        <h1 className="mt-1 font-serif text-3xl text-ink">{product.name}</h1>
        <div className="mt-2">
          <StarRating value={product.ratings} count={product.numReviews} />
        </div>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="font-serif text-3xl text-ink">
            {formatCurrency(hasDiscount ? product.discountPrice! : product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted line-through">{formatCurrency(product.price)}</span>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted">{product.description}</p>

        {seller && (
          <p className="mt-4 text-sm text-muted">
            Sold by <span className="font-medium text-ink">{seller.name}</span>
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {product.stock > 0 ? (
            <>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="input w-20"
              />
              <button onClick={handleAddToCart} className="btn-primary" disabled={!user}>
                Add to cart
              </button>
            </>
          ) : (
            <span className="text-sm font-medium text-red-700">Out of stock</span>
          )}

          {user && seller && user._id !== seller._id && (
            <button onClick={handleMessageSeller} className="btn-secondary">
              Message seller
            </button>
          )}

          {status && <span className="text-sm text-forest">{status}</span>}
        </div>
        {!user && <p className="mt-2 text-xs text-muted">Sign in to add items to your cart.</p>}
      </div>

      <div className="md:col-span-2">
        <h2 className="section-title mb-4">Reviews</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ReviewList reviews={reviews as any} />
          {user ? (
            <ReviewForm
              onSubmit={async (rating, comment) => {
                await addReviewApi(product._id, rating, comment);
                refetch();
              }}
            />
          ) : (
            <p className="text-sm text-muted">Sign in to write a review.</p>
          )}
        </div>
      </div>
    </div>
  );
}
