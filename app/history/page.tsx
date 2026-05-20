import { Shell } from "@/components/layout/Shell";
import { HistoryList } from "@/components/history/HistoryList";

export default function HistoryPage() {
  return (
    <Shell title="Historique">
      <div className="pb-20 md:pb-0">
        <HistoryList />
      </div>
    </Shell>
  );
}
