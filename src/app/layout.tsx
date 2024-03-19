import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { ToastContainer } from "react-toastify";
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const aminFont = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "amin",
  description: "amin",
};

function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-slate-200 px-2 h-16">
      <Link href="/" className="text-2xl font-bold flex items-center gap-2">
        amin 🙋
      </Link>
      <div>
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={aminFont.className}>
          <main className="flex min-h-screen flex-col">
            <Navbar />
            {children}
          </main>
          <ToastContainer position="bottom-right" stacked />
        </body>
      </html>
    </ClerkProvider>
  );
}
