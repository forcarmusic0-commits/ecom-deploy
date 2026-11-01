export default function StarRating({ value, count }: { value: number; count?: number }) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-1 text-sm" aria-label={`Rated ${value} out of 5`}>
      <span className="text-ochre" aria-hidden="true">
        {"★".repeat(rounded)}
        {"☆".repeat(5 - rounded)}
      </span>
      {typeof count === "number" && <span className="text-muted">({count})</span>}
    </div>
  );
}
