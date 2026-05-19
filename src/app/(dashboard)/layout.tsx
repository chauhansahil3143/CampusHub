import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";

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
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 h-[100dvh] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
