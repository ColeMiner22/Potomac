import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Donor Analytics Dashboard",
  description: "Analyze and visualize donor giving patterns",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
