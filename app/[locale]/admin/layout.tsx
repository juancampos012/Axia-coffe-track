// app/platform/dashboard/layout.tsx
import type { Metadata } from "next";

import HomeBox from "@/components/organisms/HomeBox";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Dashboard for managing the platform - Axia",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="justify-center items-center bg-[#0a1120]">
      <HomeBox>
        {children}
      </HomeBox>
    </main>
  );
}
