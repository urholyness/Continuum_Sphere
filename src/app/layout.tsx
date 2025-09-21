import "./globals.css";
import type { Metadata } from "next";
import GlobalNav from "@/components/navigation/GlobalNav";

export const metadata: Metadata = {
  title: "GreenStemGlobal",
  description: "Humble roots, bold tech — traceable, sustainable produce.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0A1416] text-white">
        <GlobalNav />
        <main>{children}</main>
      </body>
    </html>
  );
}