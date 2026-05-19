import { createClient } from "@/lib/supabase/server";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, GraduationCap, BookOpen, Star, Bookmark } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch complete profile from database
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user's uploaded notes
  const { data: userNotes } = await supabase
    .from("notes")
    .select("*")
    .eq("uploaded_by", user.id)
    .order("created_at", { ascending: false });

  // Fetch user's uploaded books
  const { data: userBooks } = await supabase
    .from("books")
    .select("*")
    .eq("uploaded_by", user.id)
    .order("created_at", { ascending: false });

  // Fetch user's uploaded pyqs
  const { data: userPyqs } = await supabase
    .from("pyqs")
    .select("*")
    .eq("uploaded_by", user.id)
    .order("created_at", { ascending: false });

  // Merge all uploads
  const allUploads = [
    ...(userNotes || []).map(n => ({ ...n, type: "notes", typeLabel: "Note", details: `Sem ${n.semester} • ${n.subject}` })),
    ...(userBooks || []).map(b => ({ ...b, type: "books", typeLabel: "Book", details: `by ${b.author} • ${b.category}` })),
    ...(userPyqs || []).map(p => ({ ...p, type: "pyqs", typeLabel: "PYQ", details: `Year ${p.year} • Sem ${p.semester}` }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Fetch user's bookmarked items across notes, books, and pyqs
  const { data: bookmarkedItems } = await supabase
    .from("bookmarks")
    .select(`
      id,
      notes(*, uploaded_by:users(full_name)),
      books(*, uploaded_by:users(full_name)),
      pyqs(*, uploaded_by:users(full_name))
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Merge and format bookmarks
  const formattedBookmarks = (bookmarkedItems || []).map((bookmark: any) => {
    if (bookmark.notes) {
      return { 
        ...bookmark.notes, 
        typeLabel: "Note", 
        details: `Sem ${bookmark.notes.semester} • ${bookmark.notes.subject}`, 
        author: bookmark.notes.uploaded_by?.full_name 
      };
    }
    if (bookmark.books) {
      return { 
        ...bookmark.books, 
        typeLabel: "Book", 
        details: `by ${bookmark.books.author} • ${bookmark.books.category}`, 
        author: bookmark.books.uploaded_by?.full_name 
      };
    }
    if (bookmark.pyqs) {
      return { 
        ...bookmark.pyqs, 
        typeLabel: "PYQ", 
        details: `Year ${bookmark.pyqs.year} • Sem ${bookmark.pyqs.semester}`, 
        author: bookmark.pyqs.uploaded_by?.full_name 
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Profile Sidebar */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="border-border/50 shadow-sm text-center pt-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold mb-4 overflow-hidden border-4 border-background shadow-lg">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"
              )}
            </div>
            <CardHeader className="pt-0">
              <CardTitle className="text-2xl">{profile?.full_name || "Anonymous User"}</CardTitle>
              <div className="flex justify-center mt-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {profile?.role === 'admin' ? 'Admin' : profile?.role === 'senior' ? 'Senior Contributor' : 'Junior Student'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="text-sm truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span className="text-sm truncate">{profile?.branch || "Branch not specified"}</span>
              </div>
              <a href="/onboarding" className={buttonVariants({ variant: "outline", className: "w-full mt-4" })}>
                Edit Profile
              </a>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 text-yellow-600 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Top Contributor</p>
                  <p className="text-xs text-muted-foreground">Uploaded {allUploads.length} resources</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-2/3 space-y-6">
          <h2 className="text-2xl font-bold mb-6">Your Uploads</h2>
          
          {(allUploads.length === 0) ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-border/50 bg-muted/20">
              <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No uploads yet</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">Start contributing to your college community.</p>
              <a href="/study-material/upload" className={buttonVariants()}>Upload your first Resource</a>
            </div>
          ) : (
            <div className="grid gap-4">
              {allUploads.map((item: any) => (
                <div key={item.id} className="p-4 rounded-xl border border-border/50 bg-card flex justify-between items-center group hover:border-primary/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium group-hover:text-primary transition-colors">{item.title || item.subject}</h4>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{item.typeLabel}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.details}</p>
                  </div>
                  <a href={item.pdf_url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "ghost", className: "text-primary hover:text-primary/80" })}>
                    View PDF
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Bookmarked Notes Section */}
          <div className="pt-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-primary" /> Bookmarked Material
            </h2>
            
            {(formattedBookmarks.length === 0) ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border/50 bg-muted/20">
                <Bookmark className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No bookmarks yet</h3>
                <p className="text-muted-foreground text-sm mt-1 mb-4">Save materials for quick access later.</p>
                <a href="/study-material" className={buttonVariants({ variant: "outline" })}>Browse Materials</a>
              </div>
            ) : (
              <div className="grid gap-4">
                {formattedBookmarks.map((bookmark: any) => {
                  return (
                    <div key={bookmark.id} className="p-4 rounded-xl border border-border/50 bg-card flex justify-between items-center group hover:border-primary/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium group-hover:text-primary transition-colors">{bookmark.title || bookmark.subject}</h4>
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{bookmark.typeLabel}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{bookmark.details} • By {bookmark.author || "Unknown"}</p>
                      </div>
                      <a href={bookmark.pdf_url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "ghost", className: "text-primary hover:text-primary/80" })}>
                        View PDF
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
