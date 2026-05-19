import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Download, FileText, Upload, Book, Bookmark } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import StudyMaterialSearch from "@/components/study-material/StudyMaterialSearch";
import BookmarkButton from "@/components/notes/BookmarkButton";

export default async function StudyMaterialPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; sem?: string; subject?: string }> }) {
  const { tab = "notes", q = "", sem = "", subject = "" } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let notes: any[] = [];
  let books: any[] = [];
  let pyqs: any[] = [];
  let error = null;

  if (tab === "notes") {
    let query = supabase
      .from("notes")
      .select("*, uploaded_by (full_name, avatar_url), bookmarks(id)")
      .order("created_at", { ascending: false });
    
    if (q) {
      query = query.or(`title.ilike.%${q}%,subject.ilike.%${q}%,branch.ilike.%${q}%`);
    }
    if (sem) {
      query = query.eq("semester", parseInt(sem));
    }
    if (subject) {
      query = query.eq("subject", subject);
    }
    const res = await query;
    notes = res.data || [];
    error = res.error;
  } else if (tab === "books") {
    let query = supabase
      .from("books")
      .select("*, uploaded_by (full_name), bookmarks(id)")
      .order("created_at", { ascending: false });
    
    if (q) {
      query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%,category.ilike.%${q}%`);
    }
    if (subject) {
      query = query.eq("category", subject);
    }
    const res = await query;
    books = res.data || [];
    error = res.error;
  } else if (tab === "pyqs") {
    let query = supabase
      .from("pyqs")
      .select("*, uploaded_by (full_name), bookmarks(id)")
      .order("year", { ascending: false });
    
    if (q) {
      query = query.or(`subject.ilike.%${q}%,branch.ilike.%${q}%`);
    }
    if (sem) {
      query = query.eq("semester", parseInt(sem));
    }
    if (subject) {
      query = query.eq("subject", subject);
    }
    const res = await query;
    pyqs = res.data || [];
    error = res.error;
  }

  // Fetch unique subjects dynamically (filtered by semester if selected)
  let notesSubjectsQuery = supabase.from("notes").select("subject");
  let pyqsSubjectsQuery = supabase.from("pyqs").select("subject");
  if (sem) {
    notesSubjectsQuery = notesSubjectsQuery.eq("semester", parseInt(sem));
    pyqsSubjectsQuery = pyqsSubjectsQuery.eq("semester", parseInt(sem));
  }
  
  const [notesSubjectsRes, pyqsSubjectsRes, booksCategoriesRes] = await Promise.all([
    notesSubjectsQuery,
    pyqsSubjectsQuery,
    supabase.from("books").select("category")
  ]);

  const uniqueSubjects = Array.from(
    new Set([
      ...(notesSubjectsRes.data || []).map(n => n.subject),
      ...(pyqsSubjectsRes.data || []).map(p => p.subject)
    ])
  ).filter(Boolean).sort();

  const uniqueCategories = Array.from(
    new Set((booksCategoriesRes.data || []).map(b => b.category))
  ).filter(Boolean).sort();

  const tabs = [
    { id: "notes", name: "Notes", icon: FileText },
    { id: "books", name: "Books & Reference", icon: Book },
    { id: "pyqs", name: "PYQs (Exams)", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Study Material</h1>
            <p className="text-muted-foreground mt-1">Access notes, books, and past exam papers shared by peers.</p>
          </div>
          <Link 
            href={`/study-material/upload?type=${tab}`} 
            className={buttonVariants()}
          >
            <Upload className="w-4 h-4 mr-2" /> Upload {tab === "notes" ? "Notes" : tab === "books" ? "Book" : "PYQ"}
          </Link>
        </div>

        {/* Unified Tab Navigation */}
        <div className="flex border-b border-border/50 mb-8 gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <Link
                key={t.id}
                href={`/study-material?tab=${t.id}`}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                  isActive 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.name}
              </Link>
            );
          })}
        </div>

        {/* Search & Filters */}
        <StudyMaterialSearch 
          activeTab={tab} 
          subjects={uniqueSubjects} 
          categories={uniqueCategories} 
        />

        {error ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            Failed to load resources. Please check your database connection.
          </div>
        ) : (
          <div>
            {/* Notes Rendering */}
            {tab === "notes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {notes.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No notes found. Be the first to upload!</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="group relative bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                      <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
                        {note.thumbnail_url ? (
                          <img src={note.thumbnail_url} alt={note.title} className="object-cover w-full h-full" />
                        ) : (
                          <FileText className="w-12 h-12 text-primary/30" />
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-background/80 backdrop-blur-md">Sem {note.semester}</Badge>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">{note.branch}</Badge>
                          <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">{note.subject}</Badge>
                        </div>
                        
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{note.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[40px]">{note.description}</p>
                        
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
                          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                            {note.uploaded_by?.full_name || "Unknown"}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {user && (
                              <BookmarkButton 
                                noteId={note.id} 
                                userId={user.id} 
                                initialBookmarked={note.bookmarks && note.bookmarks.length > 0} 
                              />
                            )}
                            <a href={note.pdf_url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 rounded-full" })}>
                              <Download className="w-4 h-4 text-primary" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Books Rendering */}
            {tab === "books" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    <Book className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No books found. Be the first to share one!</p>
                  </div>
                ) : (
                  books.map((book) => (
                    <div key={book.id} className="group relative bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between h-full">
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex gap-2 mb-3">
                          <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">{book.category || "Reference"}</Badge>
                        </div>
                        
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{book.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">by {book.author || "Unknown Author"}</p>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1">{book.description}</p>
                        
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
                          <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                            Shared: {book.uploaded_by?.full_name || "Anonymous"}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {user && (
                              <BookmarkButton 
                                bookId={book.id} 
                                userId={user.id} 
                                initialBookmarked={book.bookmarks && book.bookmarks.length > 0} 
                              />
                            )}
                            <a href={book.pdf_url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 rounded-full" })}>
                              <Download className="w-4 h-4 text-primary" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PYQs Rendering */}
            {tab === "pyqs" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pyqs.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No PYQs found. Be the first to share one!</p>
                  </div>
                ) : (
                  pyqs.map((pyq) => (
                    <div key={pyq.id} className="group relative bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between h-full">
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">{pyq.branch}</Badge>
                          <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">Sem {pyq.semester}</Badge>
                        </div>
                        
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{pyq.subject}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Year: {pyq.year}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                          <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                            Shared: {pyq.uploaded_by?.full_name || "Anonymous"}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {user && (
                              <BookmarkButton 
                                pyqId={pyq.id} 
                                userId={user.id} 
                                initialBookmarked={pyq.bookmarks && pyq.bookmarks.length > 0} 
                              />
                            )}
                            <a href={pyq.pdf_url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 rounded-full" })}>
                              <Download className="w-4 h-4 text-primary" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
