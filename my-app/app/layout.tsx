import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import './globals.css';
import { SessionProvider } from '@/components/auth';
import { CartProvider } from '@/contexts/CartContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/ui/ToastContainer';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ['500', '700'],
})
export const metadata: Metadata = {
  title: "Genprint AI - Custom Merch Design Platform",
  description: "Unleash your creativity with Genprint AI. Create unique designs and bring them to life on high-quality merchandise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} antialiased`}
      >
        <SessionProvider>
          <ToastProvider>
            <CartProvider>
              {children}
            </CartProvider>
            <ToastContainer />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
