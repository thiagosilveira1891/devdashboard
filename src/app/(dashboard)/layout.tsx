import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { isDemoMode } from "@/lib/demo";
import { getCurrentUser } from "@/lib/user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  return (
    <div className="flex flex-1">
      <Sidebar user={user} isDemo={isDemoMode()} />
      <main className="flex-1 min-w-0">
        <div className="max-w-[1200px] mx-auto px-5 lg:px-10 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
