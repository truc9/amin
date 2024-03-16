import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { ToastContainer } from "react-toastify";
import { Suspense } from "react";
import { Skeleton } from "@/components";

const inter = Inter({ subsets: ["latin"] });

function BigLoading() {
  return (
    <div className="bg-white flex flex-col gap-2">
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </div>
  );
}

export const metadata: Metadata = {
  title: "amin",
  description: "amin | I'm in anyway",
};

function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-white px-2 h-16 shadow">
      <h3 className="text-lg font-bold flex items-center gap-2 text-green-500">
        AMIN
      </h3>
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
        <body className={inter.className}>
          <main className="flex min-h-screen flex-col">
            <Navbar />
            <Suspense fallback={<BigLoading />}>{children}</Suspense>
          </main>
          <ToastContainer position="bottom-right" stacked />
        </body>
      </html>
    </ClerkProvider>
  );
}
