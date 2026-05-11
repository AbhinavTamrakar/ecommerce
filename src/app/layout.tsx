import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { CartInitializer } from "@/components/cart/CartInitializer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { Bodoni_Moda, Jost } from 'next/font/google';
import { ConditionalBanner } from "@/components/layout/ConditionalBanner";

const bodoni = Bodoni_Moda({ 
  subsets: ['latin'], 
  variable: '--font-display',
  weight: '400' 
})

const jost = Jost({ 
  subsets: ['latin'], 
  variable: '--font-body',
  weight:'500'
}) 

export const metadata: Metadata = {
  title: "ShakTa — Modern Fashion Store",
  description: "Discover curated fashion with ShakTa. Premium clothing and accessories.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodoni.variable} ${jost.variable}`}>
      <body>
        <CartInitializer />
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              background: "#1a1a1a",
              color: "#fff",
              borderRadius: "2px",
            },
          }}
        />
        <Navbar />
        <ConditionalBanner />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
