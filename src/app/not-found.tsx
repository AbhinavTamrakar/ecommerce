import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-bold text-[var(--color-border)]" style={{ fontFamily: "var(--font-display)" }}>
          404
        </p>
        <h1 className="text-2xl font-bold mt-4 mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Page not found
        </h1>
        <p className="text-[var(--color-muted)] mb-8 text-sm">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="btn-primary">Go Home</Link>
      </div>
    </div>
  );
}
