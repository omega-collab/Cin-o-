"use client";

import { Nav } from "./Nav";
import { Header } from "./Header";

interface ShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function Shell({ children, title, subtitle }: ShellProps) {
  return (
    <div className="flex min-h-screen">
      <Nav />
      <div className="flex flex-col flex-1 min-w-0">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 px-4 md:px-6 pb-28 md:pb-8 pt-1 max-w-2xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
