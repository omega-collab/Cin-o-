import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export const metadata: Metadata = {
  title: "CinéO — Feuille de service",
  description: "Gestion interactive pour tournages cinéma et série",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
