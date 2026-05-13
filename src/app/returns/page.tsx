import React from "react";
import { RotateCcw, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-4">Support</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
            Returns & Exchanges
          </h1>
          <p className="text-[var(--color-muted)] max-w-xl">
            We want you to love your purchase. If you're not completely satisfied, our returns process is simple and straightforward.
          </p>
        </header>

        <div className="grid md:grid-cols-[1fr_300px] gap-12">
          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-[var(--color-accent)]" size={24} />
                <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Return Policy</h2>
              </div>
              <p className="text-[var(--color-charcoal)] leading-relaxed mb-4">
                You have 30 days from the date of delivery to return or exchange your items. 
                To be eligible, items must be unworn, unwashed, and in their original packaging with all tags attached.
              </p>
              <ul className="space-y-3">
                {[
                  "Refunds are processed within 7-10 business days.",
                  "Original shipping costs are non-refundable.",
                  "Final sale items cannot be returned.",
                ].map((text) => (
                  <li key={text} className="flex gap-2 text-sm text-[var(--color-muted)]">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                    {text}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <RotateCcw className="text-[var(--color-accent)]" size={24} />
                <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>How to Return</h2>
              </div>
              <div className="space-y-6">
                {[
                  { step: 1, title: "Initiate Request", desc: "Contact our support team with your order number." },
                  { step: 2, title: "Pack Items", desc: "Place the items safely back in their original packaging." },
                  { step: 3, title: "Ship Back", desc: "Affix the prepaid label and drop it off at any authorized carrier location." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-[var(--color-charcoal)] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-[var(--color-muted)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside>
            <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm sticky top-28">
              <AlertCircle className="text-orange-500 mb-4" size={32} />
              <h3 className="font-bold mb-4">Need Help?</h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-6">
                Our customer care team is available to assist you with any questions regarding your return.
              </p>
              <a href="/contact" className="block w-full bg-[var(--color-charcoal)] text-white text-center py-3 rounded-xl text-sm font-bold hover:bg-[var(--color-accent)] transition-colors">
                Contact Support
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
