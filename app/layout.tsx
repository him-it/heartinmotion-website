import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/navbar";
import { SessionProvider } from "next-auth/react";
import { Loading } from "@/components/loading";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Heart in Motion",
  description: "Serving the Community from our Hearts",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <SessionProvider>
      <html lang="en" className={`${jakarta.variable} ${mono.variable}`}>
        <body className="min-h-screen flex flex-col font-sans antialiased">
            <Navbar />
            <Loading />
          <main className="flex-1 w-full">
            { children }
          </main>
          <footer className="mt-20 border-t border-border">
            <div className="mx-auto max-w-6xl px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <img src="/assets/logo.png" alt="" className="h-6 w-auto" />
                <span>© Heart in Motion</span>
              </div>
              <p className="text-sm text-muted-foreground text-center sm:text-right">
                A non-profit, tax-exempt 501(c)(3) organization.
              </p>
            </div>
          </footer>
        </body>
      </html>
    </SessionProvider>
  );
}
