import { notFound } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { DepartmentHistoryView } from "@/components/departments/DepartmentHistoryView";
import { DEPARTMENTS } from "@/lib/data/departments";
import type { DepartmentSlug } from "@/lib/types";

interface PageProps {
  params: { slug: string };
}

const VALID_SLUGS = DEPARTMENTS.map((d) => d.slug);

export function generateStaticParams() {
  return DEPARTMENTS.map((d) => ({ slug: d.slug }));
}

export default function DepartmentHistoryPage({ params }: PageProps) {
  if (!VALID_SLUGS.includes(params.slug as DepartmentSlug)) {
    notFound();
  }
  const dept = DEPARTMENTS.find((d) => d.slug === params.slug);
  return (
    <Shell title={`Historique — ${dept?.name ?? "Département"}`}>
      <DepartmentHistoryView slug={params.slug as DepartmentSlug} />
    </Shell>
  );
}
