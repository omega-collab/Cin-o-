import { Shell } from "@/components/layout/Shell";
import { HeuresView } from "@/components/heures/HeuresView";

export default function HeuresPage() {
  return (
    <Shell title="Mes Heures" subtitle="Suivi intermittent du spectacle">
      <HeuresView />
    </Shell>
  );
}
