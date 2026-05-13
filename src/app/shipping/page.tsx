import React from "react";
import { Truck, Globe, Clock, Package } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-4">Delivery</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
            Shipping Information
          </h1>
          <p className="text-[var(--color-muted)] max-w-xl">
            We deliver globally, ensuring your ShakTa pieces arrive safely and promptly at your doorstep.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
            <Truck className="text-[var(--color-accent)] mb-4" size={24} />
            <h3 className="font-bold mb-2">Domestic Shipping</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              Standard delivery takes 3-5 business days. Express shipping is available for urgent orders, arriving within 1-2 business days.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
            <Globe className="text-[var(--color-accent)] mb-4" size={24} />
            <h3 className="font-bold mb-2">International Shipping</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              We ship to over 100 countries. Delivery typically takes 7-14 business days depending on the destination and customs.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
            <Clock className="text-[var(--color-accent)] mb-4" size={24} />
            <h3 className="font-bold mb-2">Order Processing</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              Orders placed before 2 PM are processed the same day. All other orders are processed the next business day.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
            <Package className="text-[var(--color-accent)] mb-4" size={24} />
            <h3 className="font-bold mb-2">Tracking Your Order</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              Once your order has shipped, you will receive a tracking number via email to monitor its progress.
            </p>
          </div>
        </div>

        <section className="bg-[var(--color-charcoal)] text-white p-10 rounded-[2rem] overflow-hidden">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>Customs & Duties</h2>
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            For international orders, please note that customs fees and import duties may be applied by your local government. 
            ShakTa is not responsible for these charges, which are the recipient's responsibility.
          </p>
          <div className="bg-white/10 h-px w-full"></div>
          <p className="mt-6 text-xs text-white/40">
            Need more info? Contact our support team at support@shakta.com
          </p>
        </section>
      </div>
    </div>
  );
}
