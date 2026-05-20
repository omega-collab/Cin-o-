import { Shell } from "@/components/layout/Shell";
import { Hero } from "@/components/today/Hero";
import { ScheduleList } from "@/components/today/ScheduleList";
import { CanteenCard } from "@/components/today/CanteenCard";
import { AlertsCard } from "@/components/today/AlertsCard";

export default function HomePage() {
  return (
    <Shell title="Aujourd'hui" subtitle="Lundi 20 mai 2026">
      <div className="space-y-4">
        <Hero />
        <ScheduleList />
        <div className="grid grid-cols-2 gap-3">
          <AlertsCard />
          <CanteenCard />
        </div>
      </div>
    </Shell>
  );
}
