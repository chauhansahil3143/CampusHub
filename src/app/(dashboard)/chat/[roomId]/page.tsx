import { createClient } from "@/lib/supabase/server";
import ChatRoomClient from "@/components/chat/ChatRoomClient";
import { notFound } from "next/navigation";
import ShareRoomButton from "@/components/chat/ShareRoomButton";
import DeleteRoomButton from "@/components/chat/DeleteRoomButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

  // Automatically join the room if not already a member
  const { data: membership } = await supabase
    .from("room_members")
    .select("id")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    await supabase
      .from("room_members")
      .insert({
        room_id: roomId,
        user_id: user.id
      });
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
        <div className="flex items-center gap-2">
          <Link href="/chat" className="md:hidden p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground mr-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="font-bold text-lg"># {room.room_name}</h2>
        </div>
        <div className="flex items-center gap-2">
          {room.created_by === user.id && (
            <DeleteRoomButton roomId={roomId} roomName={room.room_name} />
          )}
          <ShareRoomButton roomId={roomId} roomName={room.room_name} />
        </div>
      </div>
      
      <ChatRoomClient 
        roomId={roomId} 
        userId={user.id} 
        initialMessages={initialMessages || []} 
      />
    </div>
  );
}
