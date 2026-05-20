import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import MobileHeader from "@/components/shared/MobileHeader";
import MobileNav from "@/components/shared/MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from("users")
    .select("semester, branch")
    .eq("id", user.id)
    .single();

  if (profile && (!profile.semester || !profile.branch)) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-muted/5 flex flex-col md:flex-row relative">
      <MobileHeader />
      <Sidebar />
      <main className="flex-1 h-[calc(100dvh-57px)] md:h-[100dvh] overflow-y-auto pb-24 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
