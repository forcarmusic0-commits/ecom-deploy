import { DashboardStats } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";

export default function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    { label: "Total users", value: stats.totalUsers },
    { label: "Total products", value: stats.totalProducts },
    { label: "Total orders", value: stats.totalOrders },
    { label: "Revenue (paid orders)", value: formatCurrency(stats.totalRevenue) },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="card p-4">
          <p className="text-xs uppercase tracking-wide text-muted">{c.label}</p>
          <p className="mt-1 font-serif text-2xl text-ink">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
