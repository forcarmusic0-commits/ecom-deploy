import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="font-serif text-4xl text-ink">404</p>
      <p className="text-sm text-muted">This page doesn't exist.</p>
      <Link to="/" className="btn-primary mt-2">
        Back to shop
      </Link>
    </div>
  );
}
