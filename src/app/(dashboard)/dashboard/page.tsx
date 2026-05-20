import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, 
  MessageSquare, 
  Upload, 
  User, 
  Sparkles, 
  Bookmark,
  ArrowRight,
  Download,
  GraduationCap
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookmarkButton from "@/components/notes/BookmarkButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile info
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch statistics
  const [
    { count: notesCount },
    { count: booksCount },
    { count: pyqsCount },
    { count: userBookmarksCount }
  ] = await Promise.all([
    supabase.from("notes").select("*", { count: "exact", head: true }),
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("pyqs").select("*", { count: "exact", head: true }),
    supabase.from("bookmarks").select("*", { count: "exact", head: true }).eq("user_id", user.id)
  ]);

  // Fetch recent uploads (mix of notes/books/pyqs)
  const { data: recentNotes } = await supabase
    .from("notes")
    .select("*, uploaded_by (full_name), bookmarks(id)")
    .order("created_at", { ascending: false })
    .limit(4);

  const totalMaterials = (notesCount || 0) + (booksCount || 0) + (pyqsCount || 0);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/80 to-purple-600 p-6 md:p-8 text-white shadow-xl shadow-primary/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]"></div>
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <Badge className="bg-white/20 hover:bg-white/35 text-white border-none py-1 px-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-yellow-300 fill-yellow-300" />
              Welcome to CampusHub
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Hey, {profile?.full_name?.split(" ")[0] || "Student"}! 👋
            </h1>
            <p className="text-white/80 max-w-xl text-sm md:text-base">
              Ready to crush your studies? You are in <strong className="font-bold text-white">Semester {profile?.semester || "1"}</strong> for <strong className="font-bold text-white">{profile?.branch || "your branch"}</strong>. Explore the library or jump into chats!
            </p>
          </div>

          <div className="flex flex-row items-center gap-3 w-full sm:w-auto shrink-0 mt-2 md:mt-0">
            <Link 
              href="/study-material/upload" 
              className="flex-1 sm:flex-none bg-white hover:bg-white/90 text-primary font-bold shadow-lg shadow-white/10 h-10 px-4 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-[1.02] active:scale-95 text-xs sm:text-sm whitespace-nowrap"
            >
              <Upload className="w-4 h-4 mr-2" /> Upload Material
            </Link>
            <Link 
              href="/chat" 
              className="flex-1 sm:flex-none bg-white/10 border border-white/20 hover:bg-white/20 text-white h-10 px-4 rounded-xl font-semibold flex items-center justify-center shrink-0 transition-all hover:scale-[1.02] active:scale-95 text-xs sm:text-sm whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Join Chats
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          icon={<BookOpen className="w-5 h-5 text-blue-500" />} 
          label="Total Study Material" 
          value={totalMaterials} 
          description="Notes, books, & PYQs"
        />
        <StatsCard 
          icon={<Bookmark className="w-5 h-5 text-yellow-500" />} 
          label="Your Bookmarks" 
          value={userBookmarksCount || 0} 
          description="Saved for later reference"
        />
        <StatsCard 
          icon={<GraduationCap className="w-5 h-5 text-green-500" />} 
          label="Your Semester" 
          value={profile?.semester || "-"} 
          description="Semester tracking"
        />
        <StatsCard 
          icon={<User className="w-5 h-5 text-purple-500" />} 
          label="Profile Level" 
          value={totalMaterials > 5 ? "Contributor" : "Member"} 
          description="Contribute more to level up"
        />
      </div>

      {/* Main Content Sections */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: What's New Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">What's New 🚀</h2>
              <p className="text-sm text-muted-foreground">The latest academic resources shared by your peers.</p>
            </div>
            <Link href="/study-material" className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl transition-all flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {!recentNotes || recentNotes.length === 0 ? (
              <p className="col-span-full text-muted-foreground text-center py-8">No recent uploads available.</p>
            ) : (
              recentNotes.map((note) => (
                <div 
                  key={note.id} 
                  className="bg-card/50 backdrop-blur-md border border-border p-5 rounded-2xl flex flex-col justify-between hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold">{note.branch}</Badge>
                      <Badge className="bg-primary/10 text-primary border-none text-[10px]">Sem {note.semester}</Badge>
                    </div>
                    <h3 className="font-semibold text-base line-clamp-1">{note.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]">{note.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                      By {note.uploaded_by?.full_name || "Seniors"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {user && (
                        <BookmarkButton 
                          noteId={note.id} 
                          userId={user.id} 
                          initialBookmarked={note.bookmarks && note.bookmarks.length > 0} 
                        />
                      )}
                      <a href={note.pdf_url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "ghost", size: "icon", className: "h-7 w-7 rounded-full shrink-0" })}>
                        <Download className="w-3.5 h-3.5 text-primary" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Links & Rules */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
            <p className="text-sm text-muted-foreground">Speed up your workflow.</p>
          </div>

          <div className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-4 divide-y divide-border">
            <QuickLink 
              href="/study-material?tab=notes"
              title="Browse Lecture Notes"
              description="Learn from senior handwritings & slides"
            />
            <QuickLink 
              href="/study-material?tab=pyqs"
              title="Practice PYQs"
              description="Solve official university papers"
            />
            <QuickLink 
              href="/chat"
              title="Group Discussions"
              description="Connect with branch classmates"
            />
            <QuickLink 
              href="/profile"
              title="Account Dashboard"
              description="Manage your uploads & settings"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, description }: { icon: React.ReactNode; label: string; value: number | string; description: string }) {
  return (
    <div className="bg-card/50 backdrop-blur-md border border-border p-5 rounded-2xl shadow-sm space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="p-2 bg-muted/40 rounded-xl">{icon}</div>
      </div>
      <div className="text-3xl font-extrabold tracking-tight">{value}</div>
      <p className="text-[10px] text-muted-foreground">{description}</p>
    </div>
  );
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="flex justify-between items-center py-3.5 group first:pt-0 last:pb-0">
      <div className="space-y-0.5">
        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
    </Link>
  );
}
