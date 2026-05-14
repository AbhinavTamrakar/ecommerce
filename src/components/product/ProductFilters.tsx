"use client";
import { Category } from "@/types";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

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
            <Link
              href="/products"
              className={`text-sm w-full text-left py-1 transition-colors block ${
                pathname === "/products" && !currentParams.type
                  ? "font-semibold text-[var(--color-charcoal)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
              }`}
            >
              All Products
            </Link>
          </li>

          {categories.length === 0 ? (
            <li className="text-xs text-red-400 italic">
              No categories received — check that categories prop is being fetched and passed from the parent page.
            </li>
          ) : (
            categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className={`text-sm w-full text-left py-1 transition-colors block ${
                    pathname === `/category/${cat.slug}`
                      ? "font-semibold text-[var(--color-charcoal)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
                  }`}
                >
                  {cat.name}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}