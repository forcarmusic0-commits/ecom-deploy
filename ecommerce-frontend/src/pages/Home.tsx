import { useEffect, useState } from "react";
import { ProductQuery } from "@/api/product.api";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import { setQuery } from "@/store/catalogSlice";
import { useGetCategoriesQuery, useGetProductsQuery } from "@/store/catalogApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function Home() {
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.catalog.query);
  const [debouncedQuery, setDebouncedQuery] = useState<ProductQuery>(query);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data, isLoading, isFetching, isError } = useGetProductsQuery(debouncedQuery);

  const products = data?.products ?? [];
  const pages = data?.pagination?.pages || 1;
  const showLoader = isLoading || (isFetching && products.length === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Shop everything</h1>
        <p className="text-sm text-muted">Browse the catalogue saved in the database. Filter and search by name.</p>
      </div>

      <ProductFilters
        categories={categories}
        query={query}
        onChange={(next) => dispatch(setQuery(next))}
      />

      {showLoader ? (
        <Loader label="Loading products" />
      ) : isError ? (
        <EmptyState title="Could not load products" description="Check that the API is running on port 5000." />
      ) : products.length === 0 ? (
        <EmptyState title="No products match those filters" description="Try widening your search." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => dispatch(setQuery({ ...query, page }))}
                  className={`h-8 w-8 rounded text-sm ${
                    query.page === page ? "bg-forest text-white" : "border border-line hover:border-ink"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
