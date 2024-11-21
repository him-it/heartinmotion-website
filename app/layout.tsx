import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/navbar";
import { SessionProvider } from "next-auth/react";
import { Loading } from "@/components/loading";

const inter = Inter({ subsets: ["latin"] });

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
      <html lang="en">
        <body className={inter.className}>
          <Navbar />
          <Loading />
          { children }
          <footer
            className="text-center my-5 text-gray-600 text-sm mx-auto w-4/5"
          >Heart in Motion is a non-profit and tax-exempt 501(c)(3) organization.</footer>
        </body>
      </html>
    </SessionProvider>
  );
}
