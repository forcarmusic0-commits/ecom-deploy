import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { DashboardStats, User, Role, Order, Product, Category } from "@/types";
import {
  getDashboardStatsApi,
  getAllUsersApi,
  updateUserRoleApi,
  toggleUserActiveApi,
  deleteAnyProductApi,
} from "@/api/admin.api";
import { getAllOrdersApi, deliverOrderApi } from "@/api/order.api";
import { getProductsApi, createProductApi, updateProductApi, deleteProductApi } from "@/api/product.api";
import { getCategoriesApi } from "@/api/category.api";
import StatsCards from "@/components/dashboard/StatsCards";
import UsersTable from "@/components/dashboard/UsersTable";
import OrdersTable from "@/components/dashboard/OrdersTable";
import ProductsTable from "@/components/dashboard/ProductsTable";
import ProductFormModal, { ProductFormValues } from "@/components/dashboard/ProductFormModal";
import Loader from "@/components/common/Loader";

type Tab = "overview" | "users" | "orders" | "products";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [tab, setTab] = useState<Tab>(isAdmin ? "overview" : "products");

  const tabs: { id: Tab; label: string }[] = isAdmin
    ? [
        { id: "overview", label: "Overview" },
        { id: "users", label: "Users" },
        { id: "orders", label: "Orders" },
        { id: "products", label: "Products" },
      ]
    : [{ id: "products", label: "My products" }];

  return (
    <div>
      <h1 className="section-title mb-6">{isAdmin ? "Admin dashboard" : "Seller dashboard"}</h1>

      <div className="mb-6 flex gap-6 border-b border-line text-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 pb-2 transition-colors ${
              tab === t.id ? "border-forest text-forest" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && isAdmin && <OverviewTab />}
      {tab === "users" && isAdmin && <UsersTab />}
      {tab === "orders" && isAdmin && <OrdersTab />}
      {tab === "products" && <ProductsTab isAdmin={isAdmin} />}
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStatsApi().then(({ data }) => setStats(data.data));
  }, []);

  if (!stats) return <Loader />;
  return <StatsCards stats={stats} />;
}

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => getAllUsersApi().then(({ data }) => setUsers(data.data.users));

  useEffect(() => {
    load().then(() => setIsLoading(false));
  }, []);

  const handleRoleChange = async (id: string, role: Role) => {
    await updateUserRoleApi(id, role);
    load();
  };

  const handleToggleActive = async (id: string) => {
    await toggleUserActiveApi(id);
    load();
  };

  if (isLoading) return <Loader />;
  return <UsersTable users={users} onRoleChange={handleRoleChange} onToggleActive={handleToggleActive} />;
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => getAllOrdersApi().then(({ data }) => setOrders(data.data.orders));

  useEffect(() => {
    load().then(() => setIsLoading(false));
  }, []);

  const handleDeliver = async (id: string) => {
    await deliverOrderApi(id);
    load();
  };

  if (isLoading) return <Loader />;
  return <OrdersTable orders={orders} onDeliver={handleDeliver} />;
}

function ProductsTab({ isAdmin }: { isAdmin: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null | "new">(null);

  const load = async () => {
    const [prodRes, catRes] = await Promise.all([getProductsApi({ limit: 100 }), getCategoriesApi()]);
    setProducts(prodRes.data.data.products);
    setCategories(catRes.data.data.categories);
  };

  useEffect(() => {
    load().then(() => setIsLoading(false));
  }, []);

  const handleSave = async (values: ProductFormValues) => {
    if (editing && editing !== "new") {
      await updateProductApi(editing._id, values);
    } else {
      await createProductApi(values);
    }
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    if (isAdmin) {
      await deleteAnyProductApi(id);
    } else {
      await deleteProductApi(id);
    }
    await load();
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing("new")} className="btn-primary">
          Add product
        </button>
      </div>

      <ProductsTable products={products} onEdit={setEditing} onDelete={handleDelete} />

      {editing && (
        <ProductFormModal
          product={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
