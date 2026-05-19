import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground mt-1">Here is what's happening in your campus today.</p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 rounded-2xl bg-background border border-border/50 shadow-sm">
          <h3 className="font-semibold mb-2">Your Profile</h3>
          <p className="text-sm text-muted-foreground break-all">Logged in as:<br/>{user.email}</p>
        </div>
        {/* Add more cards for statistics, recent notes, etc. */}
      </div>
    </div>
  );
}
