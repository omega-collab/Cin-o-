"use client";

import Link from "next/link";
import { DEPARTMENTS } from "@/lib/data/departments";
import { useAccessStore } from "@/lib/store/useAccessStore";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function DepartmentGrid() {
  const isUnlocked = useAccessStore((s) => s.isUnlocked);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Départements</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {DEPARTMENTS.map((dept) => {
          const unlocked = isUnlocked(dept.slug);
          return (
            <Link key={dept.slug} href={`/departments/${dept.slug}`}>
              <Card
                className={cn(
                  "p-4 border-2 hover:shadow-md transition-all",
                  dept.bgColor
                )}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{dept.icon}</span>
                    <span className="text-sm">{unlocked ? "🔓" : "🔒"}</span>
                  </div>
                  <p className={cn("font-semibold text-sm", dept.color)}>
                    {dept.name}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
