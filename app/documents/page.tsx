import { Shell } from "@/components/layout/Shell";
import { DocumentsSection } from "@/components/documents/DocumentsSection";

export default function DocumentsPage() {
  return (
    <Shell title="Documents">
      <div className="pb-20 md:pb-0">
        <DocumentsSection />
      </div>
    </Shell>
  );
}
