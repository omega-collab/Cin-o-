import { Shell } from "@/components/layout/Shell";
import { Hero } from "@/components/today/Hero";
import { ScheduleList } from "@/components/today/ScheduleList";
import { CanteenCard } from "@/components/today/CanteenCard";
import { AlertsCard } from "@/components/today/AlertsCard";

export default function HomePage() {
  return (
    <Shell title="Aujourd'hui">
      <div className="space-y-5 pb-20 md:pb-0">
        <Hero />
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <ScheduleList />
          </div>
          <div className="space-y-4">
            <AlertsCard />
            <CanteenCard />
          </div>
        </div>
      </div>
    </Shell>
  );
}
