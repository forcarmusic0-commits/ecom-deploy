export default function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-forest" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}
