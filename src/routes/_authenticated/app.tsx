import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MemberShell } from "@/components/membros/MemberShell";

export const Route = createFileRoute("/_authenticated/app")({
  component: () => (
    <MemberShell>
      <Outlet />
    </MemberShell>
  ),
});
