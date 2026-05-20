import { Shell } from "@/components/layout/Shell";
import { DepartmentGrid } from "@/components/departments/DepartmentGrid";

export default function DepartmentsPage() {
  return (
    <Shell title="Départements">
      <div className="pb-20 md:pb-0">
        <DepartmentGrid />
      </div>
    </Shell>
  );
}
