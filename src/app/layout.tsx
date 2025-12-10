import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trello Clone",
  description: "Simple Trello clone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b">
              <div className="px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-800">Trello MVP</h1>
              </div>
            </nav>
            <main className="p-6">
              {" "}
              {children}
              <Toaster position="top-right" />
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
