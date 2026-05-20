import { Shell } from "@/components/layout/Shell";
import { CanteenStaffInterface } from "@/components/cantine/CanteenStaffInterface";

export default function CanteenPage() {
  return (
    <Shell title="Cantine">
      <CanteenStaffInterface />
    </Shell>
  );
}
