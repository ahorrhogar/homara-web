import type { ReactNode } from "react";
import { EditorialEngagement } from "@/components/analytics/EditorialEngagement";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <EditorialEngagement />
      {children}
    </>
  );
}
