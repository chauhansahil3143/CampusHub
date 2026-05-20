"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile } from "lucide-react";
import { format } from "date-fns";

type Message = {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url: string | null;
  };
};

export default function ChatRoomClient({ 
  roomId, 
  userId, 
  initialMessages 
}: { 
  roomId: string, 
  userId: string, 
  initialMessages: Message[] 
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const supabase = createClient();

  const popularEmojis = [
    "😀", "😂", "🤣", "😊", "😍", "🥰", "😎", "😜", "👍", "🔥", 
    "🙌", "🎉", "❤️", "✨", "💯", "🚀", "🤔", "👀", "👏", "😭", 
    "🙏", "💡", "😅", "⚡️", "💻", "🎓", "📚", "📝", "🏫", "🌟"
  ];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      }, async (payload) => {
        // Fetch sender details
        const { data: senderData } = await supabase
          .from('users')
          .select('full_name, avatar_url')
          .eq('id', payload.new.sender_id)
          .single();

        const newMsg = {
          ...payload.new,
          sender: senderData
        } as Message;

        setMessages((prev) => [...prev, newMsg]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage;
    setNewMessage("");

    // Optimistic insert could go here, but for simplicity we rely on DB response or realtime event
    const { error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender_id: userId,
        message: messageText
      });

    if (error) {
      console.error("Error sending message:", error);
      // Revert optimism if implemented
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === userId;
          const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;

          return (
            <div key={msg.id} className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {showAvatar ? (
                    msg.sender?.avatar_url ? (
                      <img src={msg.sender.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        {msg.sender?.full_name?.charAt(0) || "U"}
                      </span>
                    )
                  ) : <div className="w-8 h-8" />}
                </div>
              )}
              
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showAvatar && !isMe && (
                  <span className="text-xs text-muted-foreground ml-1 mb-1">{msg.sender?.full_name}</span>
                )}
                <div className={`px-4 py-2 rounded-2xl ${
                  isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {format(new Date(msg.created_at), "h:mm a")}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border/50 bg-background relative">
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 bg-card border border-border p-3 rounded-2xl shadow-xl z-50 w-64 max-w-[calc(100vw-32px)]">
            <div className="grid grid-cols-6 gap-2">
              {popularEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setNewMessage((prev) => prev + emoji);
                  }}
                  className="text-xl p-1.5 hover:bg-muted rounded-lg transition-colors flex items-center justify-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
        <form 
          onSubmit={(e) => {
            handleSendMessage(e);
            setShowEmojiPicker(false);
          }} 
          className="flex items-center gap-2"
        >
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`shrink-0 rounded-full h-10 w-10 ${showEmojiPicker ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}
          >
            <Smile className="w-5 h-5" />
          </Button>
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full h-10 bg-muted/20 border border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary focus:border-primary transition-all px-4"
          />
          <Button type="submit" size="icon" className="shrink-0 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
