import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MemberShell } from "@/components/membros/MemberShell";
import { useNotificationsRealtime } from "@/hooks/use-notifications";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppLayout,
});

function AppLayout() {
  useNotificationsRealtime();
  return (
    <MemberShell>
      <Outlet />
    </MemberShell>
  );
}
