import { ScheduleClient } from "./schedule-client";
import { PageContainer } from "@/components/layout/page-container";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function SchedulePage() {
  return (
    <PageContainer>
      <ScheduleClient />
      <BottomNav />
    </PageContainer>
  );
}
