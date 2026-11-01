import { useState } from "react";

export default function ReviewForm({
  onSubmit,
}: {
  onSubmit: (rating: number, comment: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment.trim());
      setComment("");
      setRating(5);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not submit your review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border border-line bg-white p-4">
      <div>
        <label className="label">Your rating</label>
        <select className="input w-32" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Your review</label>
        <textarea
          className="input min-h-[90px]"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think of this product?"
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button type="submit" className="btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}
