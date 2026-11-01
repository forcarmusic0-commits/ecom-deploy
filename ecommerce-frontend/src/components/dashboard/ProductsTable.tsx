import { Product } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";

export default function ProductsTable({
  products,
  onEdit,
  onDelete,
}: {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}) {
  if (products.length === 0) {
    return <p className="rounded border border-dashed border-line p-8 text-center text-sm text-muted">No products yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-paper text-left text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Rating</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((p) => (
            <tr key={p._id}>
              <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
              <td className="px-4 py-3">{formatCurrency(p.discountPrice || p.price)}</td>
              <td className="px-4 py-3">
                {p.stock === 0 ? <span className="text-red-700">Out of stock</span> : p.stock}
              </td>
              <td className="px-4 py-3">
                {p.ratings.toFixed(1)} ({p.numReviews})
              </td>
              <td className="space-x-3 px-4 py-3 text-right">
                <button onClick={() => onEdit(p)} className="text-sm text-forest hover:underline">
                  Edit
                </button>
                <button onClick={() => onDelete(p._id)} className="text-sm text-red-700 hover:underline">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
