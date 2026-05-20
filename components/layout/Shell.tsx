"use client";

import { Nav } from "./Nav";
import { Header } from "./Header";

interface ShellProps {
  children: React.ReactNode;
  title?: string;
}

export function Shell({ children, title }: ShellProps) {
  return (
    <div className="flex min-h-screen bg-[#0B0C14]">
      {/* Desktop sidebar — hidden on mobile */}
      <Nav />
      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header title={title} />
        {/* On mobile: add bottom padding to clear the fixed bottom nav */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
