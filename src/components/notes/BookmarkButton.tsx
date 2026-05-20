"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookmarkButton({ 
  noteId, 
  bookId,
  pyqId,
  userId, 
  initialBookmarked 
}: { 
  noteId?: string; 
  bookId?: string;
  pyqId?: string;
  userId: string; 
  initialBookmarked: boolean; 
}) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      if (isBookmarked) {
        // Delete Bookmark
        let query = supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", userId);

        if (noteId) query = query.eq("note_id", noteId);
        if (bookId) query = query.eq("book_id", bookId);
        if (pyqId) query = query.eq("pyq_id", pyqId);

        const { error } = await query;

        if (error) throw error;
        setIsBookmarked(false);
      } else {
        // Insert Bookmark
        const { error } = await supabase
          .from("bookmarks")
          .insert({
            user_id: userId,
            note_id: noteId || null,
            book_id: bookId || null,
            pyq_id: pyqId || null
          });

        if (error) throw error;
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleBookmark}
      className={`h-9 w-9 rounded-xl border shadow-sm flex items-center justify-center shrink-0 transition-all ${
        isBookmarked ? "border-primary/40 bg-primary/5 text-primary" : "border-border bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground"
      }`}
      disabled={loading}
    >
      <Bookmark className={`w-4 h-4 transition-colors ${
        isBookmarked ? "fill-primary text-primary" : ""
      }`} />
    </Button>
  );
}
