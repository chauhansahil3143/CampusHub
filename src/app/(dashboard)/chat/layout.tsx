import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MessageSquare, Hash } from "lucide-react";
import CreateRoomButton from "@/components/chat/CreateRoomButton";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  
  // Create default rooms if they don't exist
  const { data: { user } } = await supabase.auth.getUser();
  
  // 1. Fetch public rooms
  const { data: publicRooms } = await supabase
    .from("chat_rooms")
    .select("*")
    .eq("is_private", false)
    .order("created_at", { ascending: true });

  // 2. Fetch rooms where user is a member
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

  // 3. Merge and deduplicate
  const allRoomsMap = new Map();
  [...(publicRooms || []), ...joinedRooms].forEach(room => {
    allRoomsMap.set(room.id, room);
  });
  
  const rooms = Array.from(allRoomsMap.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Rooms Sidebar */}
      <div className="w-64 border-r border-border/50 bg-muted/10 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Chat Rooms</h2>
          </div>
          <CreateRoomButton />
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {rooms?.length === 0 ? (
            <p className="text-sm text-muted-foreground p-2">No rooms available.</p>
          ) : (
            rooms?.map(room => (
              <Link 
                key={room.id} 
                href={`/chat/${room.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
              >
                <Hash className="w-4 h-4 text-muted-foreground" />
                {room.room_name}
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {children}
      </div>
    </div>
  );
}
