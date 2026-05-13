import React from "react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-16 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-4">Our Story</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
            The Essence of ShakTa
          </h1>
          <div className="w-20 h-px bg-[var(--color-accent)] mx-auto opacity-30"></div>
        </header>

        <div className="space-y-12 text-[var(--color-charcoal)] leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>Modern Fashion, Timeless Values</h2>
            <p>
              ShakTa was founded on the belief that fashion should be as enduring as it is beautiful. 
              We curate collections for the modern individual who values both contemporary design and 
              the heritage of quality craftsmanship.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>Our Vision</h2>
              <p>
                We strive to create a seamless intersection between luxury aesthetics and sustainable practices. 
                Every piece in our collection is selected with an eye for detail, ensuring that your wardrobe 
                remains relevant season after season.
              </p>
            </div>
            <div className="bg-[var(--color-charcoal)] aspect-square rounded-2xl flex items-center justify-center p-12 text-white/10 italic text-center border border-white/5">
              "Style is a way to say who you are without having to speak."
            </div>
          </section>

          <section className="bg-white p-10 sm:p-16 rounded-[2rem] border border-black/5 shadow-sm overflow-hidden relative">
             <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-8 text-center" style={{ fontFamily: "var(--font-display)" }}>The Pillars of Our Brand</h2>
              <div className="grid sm:grid-cols-3 gap-10">
                <div className="text-center">
                  <span className="text-3xl block mb-4">✨</span>
                  <h3 className="font-bold mb-2 uppercase text-[10px] tracking-widest text-[var(--color-accent)]">Curation</h3>
                  <p className="text-xs text-[var(--color-muted)]">Only the finest designs make it to our store.</p>
                </div>
                <div className="text-center">
                  <span className="text-3xl block mb-4">🌿</span>
                  <h3 className="font-bold mb-2 uppercase text-[10px] tracking-widest text-[var(--color-accent)]">Sustainability</h3>
                  <p className="text-xs text-[var(--color-muted)]">Mindful of our impact on the planet.</p>
                </div>
                <div className="text-center">
                  <span className="text-3xl block mb-4">💎</span>
                  <h3 className="font-bold mb-2 uppercase text-[10px] tracking-widest text-[var(--color-accent)]">Quality</h3>
                  <p className="text-xs text-[var(--color-muted)]">Built to last and age gracefully.</p>
                </div>
              </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
