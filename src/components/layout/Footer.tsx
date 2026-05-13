import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--color-charcoal)] text-white mt-16 sm:mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10">
        <div className="md:col-span-2">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            ShakTa
          </h2>
          <p className="text-sm text-white/60 leading-relaxed max-w-sm">
            Curated fashion for the modern individual. Premium quality, timeless style, and sustainable practices at the heart of everything we do.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4">Shop</h4>
          <ul className="space-y-2">
            {[
              { label: "New Arrivals", href: "/new-arrivals" },
              { label: "Men", href: "/products?type=mens" },
              { label: "Women", href: "/products?type=women" },
              { label: "Accessories", href: "/products" },
            ].map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-sm text-white/70 hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4">Help</h4>
          <ul className="space-y-2">
            {[
              { label: "About Us", href: "/about" },
              { label: "Shipping", href: "/shipping" },
              { label: "Returns", href: "/returns" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-sm text-white/70 hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-white/30 text-xs">
          <span className="text-center md:text-left">© {new Date().getFullYear()} ShakTa. All rights reserved.</span>
          <span>Designed with care</span>
        </div>
      </div>
    </footer>
  );
}
