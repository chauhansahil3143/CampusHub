"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function CreateRoomButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create a channel.");

      // Format name: replace spaces with hyphens, lowercase
      const formattedName = roomName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      const { data, error: dbError } = await supabase
        .from("chat_rooms")
        .insert({
          room_name: formattedName,
          created_by: user.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setIsOpen(false);
      setRoomName("");
      
      // Redirect to the newly created room
      if (data) {
        router.push(`/chat/${data.id}`);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create channel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
      >
        <Plus className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Create a Channel</h3>
                <p className="text-muted-foreground text-sm">Channels are where your team communicates.</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Channel Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground font-semibold">#</span>
                  <Input 
                    type="text" 
                    placeholder="e.g. general-chat" 
                    className="pl-8" 
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Channel"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
