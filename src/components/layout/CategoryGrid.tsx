import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types";
import { getImageUrl } from "@/lib/utils";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.slice(0, 8).map((cat, i) => (
        <Link
          key={cat.id}
          href={`/category/${cat.slug}`}
          className="group relative overflow-hidden bg-gray-100 aspect-square animate-fade-up opacity-0"
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
        >
          {cat.image ? (
            <Image
              src={getImageUrl(cat.image)}
              alt={cat.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--color-border)] to-gray-200" />
          )}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
          <div className="absolute inset-0 flex items-end p-5">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider" style={{ fontFamily: "var(--font-display)" }}>
              {cat.name}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
