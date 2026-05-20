import { Shell } from "@/components/layout/Shell";
import { AdminPanel } from "@/components/admin/AdminPanel";

export default function AdminPage() {
  return (
    <Shell title="Administration">
      <div className="pb-20 md:pb-0">
        <AdminPanel />
      </div>
    </Shell>
  );
}
