import { Shell } from "@/components/layout/Shell";
import { Hero } from "@/components/today/Hero";
import { ScheduleList } from "@/components/today/ScheduleList";
import { CanteenCard } from "@/components/today/CanteenCard";
import { AlertsCard } from "@/components/today/AlertsCard";

export default function HomePage() {
  return (
    <Shell title="Aujourd'hui">
      {/* Mobile: stack — Desktop: 2-col grid */}
      <div className="space-y-4 pb-20 md:pb-0">
        <Hero />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Left: schedule (takes 2/3 on desktop) */}
          <div className="md:col-span-2">
            <ScheduleList />
          </div>

          {/* Right sidebar: alerts + canteen */}
          <div className="space-y-4">
            <AlertsCard />
            <CanteenCard />
          </div>
        </div>
      </div>
    </Shell>
  );
}
