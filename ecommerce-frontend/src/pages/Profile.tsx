import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { updateProfileApi, changePasswordApi, removeFromWishlistApi } from "@/api/user.api";
import { Product } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<"profile" | "wishlist" | "password">("profile");

  if (!user) return null;

  return (
    <div>
      <h1 className="section-title mb-6">Your account</h1>

      <div className="mb-6 flex gap-6 border-b border-line text-sm">
        {(["profile", "wishlist", "password"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-2 capitalize transition-colors ${
              tab === t ? "border-forest text-forest" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t === "password" ? "Change password" : t}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileForm onSaved={refreshUser} />}
      {tab === "wishlist" && <WishlistTab />}
      {tab === "password" && <PasswordForm />}
    </div>
  );
}

function ProfileForm({ onSaved }: { onSaved: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileApi({ name, phone });
    onSaved();
    setStatus("Saved");
    setTimeout(() => setStatus(null), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div>
        <label className="label">Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label">Phone</label>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <label className="label">Email</label>
        <input className="input bg-paper" value={user?.email} disabled />
      </div>
      {status && <p className="text-sm text-forest">{status}</p>}
      <button type="submit" className="btn-primary">
        Save changes
      </button>
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await changePasswordApi(currentPassword, newPassword);
      setStatus("Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not change password");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div>
        <label className="label">Current password</label>
        <input
          required
          type="password"
          className="input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="label">New password</label>
        <input
          required
          minLength={6}
          type="password"
          className="input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {status && <p className="text-sm text-forest">{status}</p>}
      <button type="submit" className="btn-primary">
        Update password
      </button>
    </form>
  );
}

function WishlistTab() {
  const { user, refreshUser } = useAuth();
  const wishlist = (user?.wishlist as Product[]) || [];

  const handleRemove = async (productId: string) => {
    await removeFromWishlistApi(productId);
    refreshUser();
  };

  if (wishlist.length === 0) {
    return <p className="text-sm text-muted">Nothing saved yet — tap the heart on a product to add it here.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {wishlist.map((p) => (
        <div key={p._id} className="card overflow-hidden">
          <Link to={`/products/${p._id}`} className="block aspect-square bg-forest-light">
            {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />}
          </Link>
          <div className="p-3">
            <p className="line-clamp-1 text-sm font-medium text-ink">{p.name}</p>
            <p className="text-sm text-muted">{formatCurrency(p.price)}</p>
            <button
              onClick={() => handleRemove(p._id)}
              className="mt-2 text-xs text-red-700 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
