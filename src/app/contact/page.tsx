"use client";
import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import toast from "react-hot-toast";

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

export default function ContactPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${BASE}/api/public/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to send message");

      toast.success("Message sent! We'll get back to you soon.");
      setForm({ full_name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-4">Contact Us</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
            Get in Touch
          </h1>
          <p className="text-[var(--color-muted)]">
            Whether you have a question about our collections or need assistance with an order, 
            our team is here to help.
          </p>
        </header>

        <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            {[
              { icon: <Mail size={20} />, title: "Email", info: "shaktatech@gmail.com", desc: "Our fastest respond time." },
              { icon: <Phone size={20} />, title: "Phone", info: "+977-9866437014", desc: "Mon-Fri from 9am to 6pm." },
              { icon: <MapPin size={20} />, title: "Address", info: "Kathmandu, Nepal", desc: "By appointment only." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 bg-white rounded-3xl border border-black/5 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-[var(--color-cream)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                  <p className="text-sm text-[var(--color-charcoal)] font-semibold mb-1">{item.info}</p>
                  <p className="text-xs text-[var(--color-muted)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-black/5 shadow-sm">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold">Full Name</label>
                <input 
                  required
                  value={form.full_name}
                  onChange={e => setForm({...form, full_name: e.target.value})}
                  className="w-full bg-[var(--color-cream)] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--color-accent)] outline-none" 
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold">Email Address</label>
                <input 
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full bg-[var(--color-cream)] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--color-accent)] outline-none" 
                  placeholder="hello@example.com"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold">Phone Number</label>
                <input 
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full bg-[var(--color-cream)] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--color-accent)] outline-none" 
                  placeholder="+977-98xxxxxxxx"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold">Subject</label>
                <input 
                  required
                  value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}
                  className="w-full bg-[var(--color-cream)] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--color-accent)] outline-none" 
                  placeholder="How can we help?"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold">Message</label>
                <textarea 
                  required
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  rows={5}
                  className="w-full bg-[var(--color-cream)] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--color-accent)] outline-none resize-none" 
                  placeholder="Your message..."
                />
              </div>
              <div className="sm:col-span-2 pt-4">
                <button 
                  disabled={loading}
                  className="w-full bg-[var(--color-charcoal)] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--color-accent)] transition-all disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Message"} <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
