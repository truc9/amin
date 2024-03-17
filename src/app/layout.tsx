import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { ToastContainer } from "react-toastify";
import { Suspense } from "react";
import Link from "next/link";
import { LoadingSkeleton } from "@/components/loading-skeleton";

const aminFont = Roboto_Flex({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "amin",
  description: "amin",
};

function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-white px-2 h-16 shadow">
      <Link
        href="/"
        className="text-lg font-bold flex items-center gap-2 text-green-500"
      >
        AMIN
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
          <main className="flex min-h-screen flex-col bg-slate-100">
            <Navbar />
            <Suspense fallback={<LoadingSkeleton />}>{children}</Suspense>
          </main>
          <ToastContainer position="bottom-right" stacked />
        </body>
      </html>
    </ClerkProvider>
  );
}
