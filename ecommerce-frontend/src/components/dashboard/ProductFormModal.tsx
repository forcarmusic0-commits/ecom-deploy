import { useState, useEffect } from "react";
import { Product, Category } from "@/types";

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  category: string;
}

export default function ProductFormModal({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: Product | null; // null = creating a new product
  categories: Category[];
  onClose: () => void;
  onSave: (values: ProductFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<ProductFormValues>({
    name: "",
    description: "",
    price: 0,
    discountPrice: undefined,
    stock: 0,
    images: [],
    category: categories[0]?._id || "",
  });
  const [imagesText, setImagesText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setValues({
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        images: product.images,
        category: typeof product.category === "object" ? product.category._id : product.category,
      });
      setImagesText(product.images.join(", "));
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const images = imagesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await onSave({ ...values, images });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not save product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded bg-white p-6">
        <h2 className="section-title mb-4">{product ? "Edit product" : "New product"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              required
              className="input"
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              required
              className="input min-h-[80px]"
              value={values.description}
              onChange={(e) => setValues({ ...values, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Price</label>
              <input
                required
                type="number"
                min={0}
                className="input"
                value={values.price}
                onChange={(e) => setValues({ ...values, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Discount price</label>
              <input
                type="number"
                min={0}
                className="input"
                value={values.discountPrice ?? ""}
                onChange={(e) =>
                  setValues({ ...values, discountPrice: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>
            <div>
              <label className="label">Stock</label>
              <input
                required
                type="number"
                min={0}
                className="input"
                value={values.stock}
                onChange={(e) => setValues({ ...values, stock: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="label">Category</label>
            <select
              required
              className="input"
              value={values.category}
              onChange={(e) => setValues({ ...values, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Image URLs (comma separated)</label>
            <input
              className="input"
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
