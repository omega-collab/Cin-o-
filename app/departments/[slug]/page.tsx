import { notFound } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { DepartmentRoute } from "@/components/departments/DepartmentRoute";
import { DEPARTMENTS } from "@/lib/data/departments";
import type { DepartmentSlug } from "@/lib/types";

interface PageProps {
  params: { slug: string };
}

const VALID_SLUGS = DEPARTMENTS.map((d) => d.slug);

export function generateStaticParams() {
  return DEPARTMENTS.map((d) => ({ slug: d.slug }));
}

export default function DepartmentPage({ params }: PageProps) {
  if (!VALID_SLUGS.includes(params.slug as DepartmentSlug)) {
    notFound();
  }
  const dept = DEPARTMENTS.find((d) => d.slug === params.slug);
  return (
    <Shell title={dept?.name ?? "Département"}>
      <div className="pb-20 md:pb-0">
        <DepartmentRoute slug={params.slug as DepartmentSlug} />
      </div>
    </Shell>
  );
}
