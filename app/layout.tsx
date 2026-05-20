import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export const metadata: Metadata = {
  title: "CinéO — Feuille de service",
  description: "Gestion interactive pour tournages cinéma et série",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="dark" data-font="md">
      <body className="min-h-screen text-white">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
