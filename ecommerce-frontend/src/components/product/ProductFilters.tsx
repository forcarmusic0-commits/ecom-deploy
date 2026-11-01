import { Category } from "@/types";
import { ProductQuery } from "@/api/product.api";

interface Props {
  categories: Category[];
  query: ProductQuery;
  onChange: (next: ProductQuery) => void;
}

export default function ProductFilters({ categories, query, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded border border-line bg-white p-4">
      <div className="min-w-[180px] flex-1">
        <label className="label">Search</label>
        <input
          className="input"
          placeholder="Search products…"
          value={query.keyword || ""}
          onChange={(e) => onChange({ ...query, keyword: e.target.value, page: 1 })}
        />
      </div>

      <div>
        <label className="label">Category</label>
        <select
          className="input"
          value={query.category || ""}
          onChange={(e) => onChange({ ...query, category: e.target.value || undefined, page: 1 })}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Min price</label>
        <input
          type="number"
          className="input w-28"
          value={query.minPrice ?? ""}
          onChange={(e) =>
            onChange({ ...query, minPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 })
          }
        />
      </div>

      <div>
        <label className="label">Max price</label>
        <input
          type="number"
          className="input w-28"
          value={query.maxPrice ?? ""}
          onChange={(e) =>
            onChange({ ...query, maxPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 })
          }
        />
      </div>

      <div>
        <label className="label">Sort by</label>
        <select
          className="input"
          value={query.sort || ""}
          onChange={(e) => onChange({ ...query, sort: (e.target.value || undefined) as any, page: 1 })}
        >
          <option value="">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>
    </div>
  );
}
