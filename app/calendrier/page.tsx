import { Shell } from "@/components/layout/Shell";
import { CalendarView } from "@/components/calendar/CalendarView";

export default function CalendrierPage() {
  return (
    <Shell title="Calendrier">
      <div className="pb-24 md:pb-0">
        <CalendarView />
      </div>
    </Shell>
  );
}
