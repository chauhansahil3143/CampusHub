"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function DeleteRoomButton({ roomId, roomName }: { roomId: string; roomName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from("chat_rooms")
        .delete()
        .eq("id", roomId);

      if (dbError) throw dbError;

      setIsOpen(false);
      router.push("/chat");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete channel.");
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 border-none shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xl">Delete Channel</h3>
            </div>

            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-foreground">#{roomName}</span>? This action is permanent and will delete all messages inside this channel.
            </p>

            {error && (
              <div className="p-3 mb-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Channel"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
