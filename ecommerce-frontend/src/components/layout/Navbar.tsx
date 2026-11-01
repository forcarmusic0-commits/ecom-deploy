import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors hover:text-forest ${isActive ? "text-forest font-medium" : "text-ink"}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="font-serif text-xl font-semibold tracking-tight text-ink">
          Markethouse
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Shop
          </NavLink>
          {user && (
            <NavLink to="/orders" className={navLinkClass}>
              Orders
            </NavLink>
          )}
          {user && (
            <NavLink to="/chat" className={navLinkClass}>
              Messages
            </NavLink>
          )}
          {user && (user.role === "admin" || user.role === "seller") && (
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user && (
            <Link to="/cart" className="relative text-sm text-ink hover:text-forest" aria-label="Cart">
              Cart
              {itemCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-forest text-[10px] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded border border-line px-3 py-1.5 text-sm hover:border-ink"
              >
                {user.name.split(" ")[0]}
                <span className="rounded bg-forest-light px-1.5 py-0.5 text-[10px] font-medium uppercase text-forest-dark">
                  {user.role}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded border border-line bg-white py-1 shadow-sm">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm hover:bg-paper"
                  >
                    Profile & wishlist
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-paper"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
