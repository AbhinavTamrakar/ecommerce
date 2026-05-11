import { Product } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  title?: string;
}

export function ProductGrid({ products, title }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="text-center py-20 text-[var(--color-muted)]">
        <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>No products found</p>
        <p className="text-sm mt-2">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <section>
      {title && (
        <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, i) => (
          <div key={product.id} className="animate-fade-up opacity-0" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}>
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
