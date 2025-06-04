import type { Metadata } from "next";
import { Noto_Sans_Lao } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const notoSansLao = Noto_Sans_Lao({
  subsets: ["lao"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-lao",
});

export const metadata: Metadata = {
  title: "KPT Shop",
  description: "Inventory Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="lo">
      <body className={`${notoSansLao.variable} font-sans`}>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
