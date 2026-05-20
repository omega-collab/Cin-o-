export default function CanteenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Standalone — no main nav, no Shell, no onboarding gate
  return <>{children}</>;
}
