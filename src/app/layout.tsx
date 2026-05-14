import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { CartInitializer } from "@/components/cart/CartInitializer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { Bodoni_Moda, Jost } from 'next/font/google';
import { StoreLayout } from "@/components/layout/StoreLayout";

const bodoni = Bodoni_Moda({ 
  subsets: ['latin'], 
  variable: '--font-display',
  weight: '400' 
})

const jost = Jost({ 
  subsets: ['latin'], 
  variable: '--font-body',
  weight: '500'
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
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
        <StoreLayout>{children}</StoreLayout>
      </body>
    </html>
  );
}