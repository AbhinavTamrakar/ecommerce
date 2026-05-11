"use client";
import { Category } from "@/types";
import { useRouter } from "next/navigation";

interface Props {
  categories: Category[];
  currentParams: Record<string, string | undefined>;
}

const TYPES = [
  { slug: "mens", label: "Men" },
  { slug: "women", label: "Women" },
  { slug: "unisex", label: "Unisex" },
];

export function ProductFilters({ categories, currentParams }: Props) {
  const router = useRouter();

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([k, v]) => {
      if (v && k !== key) params.set(k, v);
    });
    if (value) params.set(key, value);
    router.push(`/products?${params.toString()}`);
  };

  const clearAll = () => {
    router.push("/products");
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs uppercase tracking-widest mb-4 text-[var(--color-muted)]">
          Categories
        </h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={clearAll}
              className={`text-sm w-full text-left py-1 transition-colors ${
                !currentParams.category && !currentParams.type
                  ? "font-semibold text-[var(--color-charcoal)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
              }`}
            >
              All Products
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setParam("category", String(cat.id))}
                className={`text-sm w-full text-left py-1 transition-colors ${
                  currentParams.category === String(cat.id)
                    ? "font-semibold text-[var(--color-charcoal)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest mb-4 text-[var(--color-muted)]">
          Type
        </h3>
        <ul className="space-y-2">
          {TYPES.map(({ slug, label }) => (
            <li key={slug}>
              <button
                onClick={() =>
                  setParam("type", currentParams.type === slug ? null : slug)
                }
                className={`text-sm w-full text-left py-1 transition-colors ${
                  currentParams.type === slug
                    ? "font-semibold text-[var(--color-charcoal)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}