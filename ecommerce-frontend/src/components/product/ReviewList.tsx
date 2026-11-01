import { Review } from "@/types";
import StarRating from "@/components/common/StarRating";

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted">No reviews yet — be the first to write one.</p>;
  }

  return (
    <ul className="space-y-5">
      {reviews.map((review) => {
        const reviewer = typeof review.user === "object" ? review.user : null;
        return (
          <li key={review._id} className="border-b border-line pb-5 last:border-0">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-ink">{reviewer?.name || "User"}</p>
              <StarRating value={review.rating} />
            </div>
            <p className="text-sm text-muted">{review.comment}</p>
          </li>
        );
      })}
    </ul>
  );
}
