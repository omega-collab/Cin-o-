"use client";

import { Nav } from "./Nav";
import { Header } from "./Header";

interface ShellProps {
  children: React.ReactNode;
  title?: string;
}

export function Shell({ children, title }: ShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Nav />
      <div className="flex flex-col flex-1 min-w-0">
        <Header title={title} />
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
