"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ShoppingBag, User, Search, Menu, X, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

const BASE = process.env.NEXT_PUBLIC_API_URL;

async function getSettings() {
  try {
    const res = await fetch(`${BASE}/api/public/settings`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()).data ?? null;
  } catch {
    return null;
  }
}

export function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [headerLogo, setHeaderLogo] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("ShakTa");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch logo from settings API
  useEffect(() => {
    fetch(`${BASE}/api/public/settings`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        const data = json.data;
        if (data?.header_logo) {
          setHeaderLogo(`${BASE}/storage/${data.header_logo}`);
        }
        if (data?.name) setStoreName(data.name);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
  ];

  const categories = [
    { href: "/category/summer-collection", label: "Summer Collection" },
    { href: "/category/winter-collection", label: "Winter Collection" },
    { href: "/category/formal-wear", label: "Formal Wear" },
    { href: "/category/oversized-fit", label: "Oversized Fit" },
    { href: "/category/t-shirts", label: "T-Shirts" },
  ];

  const LogoContent = () =>
    headerLogo ? (
      <Image
        src={headerLogo}
        alt={storeName}
        width={120}
        height={40}
        className="h-9 w-auto object-contain"
        priority
      />
    ) : (
      <span
        className="text-2xl font-bold"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
      >
        {storeName}
      </span>
    );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FF8C00] shadow-md">

      {/* ── DESKTOP ── 3-column grid */}
      {!isMobile && (
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-[auto_1fr_auto] items-center gap-6 text-black">

          {/* Col 1: Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <LogoContent />
          </Link>

          {/* Col 2: Nav — centered */}
          <nav className="flex items-center justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-bold uppercase tracking-widest hover:opacity-70 transition-opacity whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
            <div className="relative group flex items-center">
              <button className="flex items-center gap-1 text-sm font-bold uppercase tracking-widest hover:opacity-70 transition-opacity whitespace-nowrap">
                Categories <ChevronDown size={13} />
              </button>
              <div className="absolute left-0 top-[calc(100%+8px)] z-50 min-w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                <div className="bg-white border border-gray-200 shadow-xl py-2 rounded-sm">
                  {categories.map((cat, i) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className={`block px-4 py-3 text-sm font-bold text-black hover:bg-orange-50 transition-colors ${
                        i < categories.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Col 3: Search + Icons */}
          <div className="flex items-center gap-3">
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-white/25 hover:bg-white/40 focus-within:bg-white rounded-sm transition-all duration-200 overflow-hidden w-44"
            >
              <Search size={14} className="ml-3 text-black/50 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 px-2 py-2 text-sm bg-transparent outline-none placeholder:text-black/50 text-black min-w-0"
              />
              {searchQuery && (
                <button type="submit" className="px-2 py-2 text-[10px] font-bold uppercase text-black/60 hover:text-black flex-shrink-0">
                  Go
                </button>
              )}
            </form>

            {isAuthenticated ? (
              <div className="relative group">
                <Link href="/account" className="p-1 hover:opacity-70 block"><User size={20} /></Link>
                <div className="absolute right-0 top-9 bg-white border border-gray-200 shadow-lg py-2 min-w-36 hidden group-hover:block z-50">
                  <Link href="/account" className="block px-4 py-2 text-sm font-semibold hover:bg-gray-100">My Account</Link>
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-100 text-red-500">Logout</button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="p-1 hover:opacity-70"><User size={20} /></Link>
            )}

            <Link href="/cart" className="relative p-1 hover:opacity-70">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}

      {/* ── MOBILE ── */}
      {isMobile && (
        <div className="px-4 py-5 flex items-center gap-3 text-black">
          <Link href="/" className="flex items-center flex-shrink-0">
            <LogoContent />
          </Link>

          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white/25 hover:bg-white/40 focus-within:bg-white rounded-sm transition-all duration-200 overflow-hidden flex-1"
          >
            <Search size={14} className="ml-3 text-black/50 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 px-2 py-2 text-sm bg-transparent outline-none placeholder:text-black/50 text-black min-w-0"
            />
            {searchQuery && (
              <button type="submit" className="px-2 py-2 text-[10px] font-bold uppercase text-black/60 hover:text-black flex-shrink-0">
                Go
              </button>
            )}
          </form>

          <Link href="/cart" className="relative p-1 hover:opacity-70 flex-shrink-0">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 hover:opacity-70 flex-shrink-0" aria-label="Toggle menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      )}

      {/* ── MOBILE MENU ── */}
      {isMobile && menuOpen && (
        <div className="bg-[#FF8C00] border-t border-black/10 px-6 py-4 flex flex-col">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm font-bold uppercase tracking-widest border-b border-black/10 hover:opacity-70"
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className="py-3 text-sm font-bold uppercase tracking-widest border-b border-black/10 flex items-center justify-between w-full"
          >
            Categories
            <ChevronDown size={14} style={{ transform: categoriesOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </button>

          {categoriesOpen && (
            <div className="pl-4 flex flex-col">
              {categories.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={() => { setMenuOpen(false); setCategoriesOpen(false); }}
                  className="py-2.5 text-sm font-semibold uppercase tracking-widest border-b border-black/5 hover:opacity-70"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          )}

          <div className="pt-2">
            {isAuthenticated ? (
              <>
                <Link href="/account" onClick={() => setMenuOpen(false)} className="py-3 text-sm font-bold uppercase tracking-widest border-b border-black/10 flex items-center gap-2">
                  <User size={16} /> My Account
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="py-3 text-sm font-bold uppercase tracking-widest text-red-700 flex items-center gap-2 w-full">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="py-3 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <User size={16} /> Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}