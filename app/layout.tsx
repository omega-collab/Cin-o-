import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cin-o- — Feuille de service",
  description: "Gestion interactive pour tournages cinéma et série",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
