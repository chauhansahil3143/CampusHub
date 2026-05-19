import { createClient } from "@/lib/supabase/server";
import ChatRoomClient from "@/components/chat/ChatRoomClient";
import { notFound } from "next/navigation";
import ShareRoomButton from "@/components/chat/ShareRoomButton";

export default async function ChatRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Verify the room exists
  const { data: room, error } = await supabase
    .from("chat_rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error || !room) {
    return notFound();
  }

  // Get initial messages
  const { data: initialMessages } = await supabase
    .from("messages")
    .select("*, sender:users(full_name, avatar_url)")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(100);

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-md z-10 flex items-center justify-between">
        <h2 className="font-bold text-lg"># {room.room_name}</h2>
        <ShareRoomButton roomId={roomId} roomName={room.room_name} />
      </div>
      
      <ChatRoomClient 
        roomId={roomId} 
        userId={user.id} 
        initialMessages={initialMessages || []} 
      />
    </div>
  );
}
