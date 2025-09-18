import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LV OCR (Sim)",
  description: "Lid Vizion OCR template — simulation by default",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

