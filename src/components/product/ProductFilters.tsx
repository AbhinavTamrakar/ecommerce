"use client";
import { Category } from "@/types";
import { useRouter, usePathname } from "next/navigation";

interface Props {
  categories: Category[];
  types?: { id: number; name: string; slug: string }[];
  currentParams: Record<string, string | undefined>;
}

export function ProductFilters({ categories, types = [], currentParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([k, v]) => {
      if (v && k !== key) params.set(k, v);
    });
    if (value) params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    router.push(pathname);
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

          {categories.length === 0 ? (
            // Remove this block once categories are confirmed to be passing correctly
            <li className="text-xs text-red-400 italic">
              No categories received — check that categories prop is being fetched and passed from the parent page.
            </li>
          ) : (
            categories.map((cat) => (
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
            ))
          )}
        </ul>
      </div>
    </div>
  );
}