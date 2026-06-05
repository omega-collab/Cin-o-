import { Shell } from "@/components/layout/Shell";
import { Hero } from "@/components/today/Hero";
import { LocationsCard } from "@/components/today/LocationsCard";
import { ScheduleList } from "@/components/today/ScheduleList";
import { CanteenCard } from "@/components/today/CanteenCard";
import { AlertsCard } from "@/components/today/AlertsCard";
import { ShiftPointageCard } from "@/components/today/ShiftPointageCard";

export default function HomePage() {
  const subtitle = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Shell title="Aujourd'hui" subtitle={subtitle}>
      <div className="space-y-4">
        <Hero />
        <ShiftPointageCard />
        <LocationsCard />
        <ScheduleList />
        <AlertsCard />
        <CanteenCard />
      </div>
    </Shell>
  );
}
