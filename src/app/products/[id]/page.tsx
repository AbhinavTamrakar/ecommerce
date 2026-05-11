import { productApi } from "@/lib/api";
import { Product } from "@/types";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { SimilarProducts } from "@/components/product/SimilarProducts";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  let product: Product | null = null;
  try {
    const res = await productApi.getById(Number(id));
    product = res.data?.data || res.data;
  } catch (err) {
    console.error('Product fetch error:', err);
    notFound();
  }

  if (!product) notFound();

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ProductDetail product={product} />
        <SimilarProducts
          categorySlug={product.category.slug}
          excludeId={product.id}
        />
      </div>
    </div>
  );
}