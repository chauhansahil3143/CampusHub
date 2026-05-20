import { createClient } from "@/lib/supabase/server";
import { MessageSquare, Hash, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import CreateRoomButton from "@/components/chat/CreateRoomButton";

export default async function ChatIndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch rooms list (same as layout logic)
  const { data: publicRooms } = await supabase
    .from("chat_rooms")
    .select("*")
    .eq("is_private", false)
    .order("created_at", { ascending: true });

  let joinedRooms: any[] = [];
  if (user) {
    const { data: memberRecords } = await supabase
      .from("room_members")
      .select("chat_rooms(*)")
      .eq("user_id", user.id);
    
    joinedRooms = (memberRecords || [])
      .map((r: any) => r.chat_rooms)
      .filter(Boolean);
  }

  const allRoomsMap = new Map();
  [...(publicRooms || []), ...joinedRooms].forEach(room => {
    allRoomsMap.set(room.id, room);
  });
  
  const rooms = Array.from(allRoomsMap.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>

      {/* Mobile-only view: Rooms list */}
      <div className="md:hidden flex flex-col h-full p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Discussions</h2>
          </div>
          <CreateRoomButton />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5">
          {rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No channels joined yet.</p>
          ) : (
            rooms.map(room => (
              <Link 
                key={room.id} 
                href={`/chat/${room.id}`}
                className="flex items-center justify-between p-4 rounded-2xl bg-card/45 backdrop-blur-md border border-border/30 active:scale-[0.99] hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/15 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-primary/70" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{room.room_name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Click to join discussion</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Desktop-only placeholder */}
      <div className="hidden md:flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold">Welcome to Campus Chat</h3>
        <p className="text-muted-foreground mt-2 max-w-sm text-center text-sm leading-relaxed">
          Select a channel from the left sidebar to start collaborating, sharing resources, or asking questions with your classmates!
        </p>
      </div>
    </div>
  );
}
