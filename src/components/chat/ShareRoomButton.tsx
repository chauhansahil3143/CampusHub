"use client";

import { useState, useEffect } from "react";
import { Share2, Link as LinkIcon, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShareRoomButton({ roomId, roomName }: { roomId: string; roomName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInviteUrl(`${window.location.origin}/chat/${roomId}`);
    }
  }, [roomId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Hey! Join the CampusHub chat channel #${roomName} here: ${inviteUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl text-xs"
      >
        <Share2 className="w-3.5 h-3.5" />
        Invite
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2 w-72 bg-card border border-border/50 rounded-xl p-4 shadow-xl z-30 animate-in fade-in slide-in-from-top-1 duration-150">
            <h4 className="font-bold text-sm mb-1">Invite Members</h4>
            <p className="text-xs text-muted-foreground mb-3">Anyone registered can join using this link.</p>

            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                readOnly 
                value={inviteUrl} 
                className="w-full bg-muted/40 border border-border/50 text-xs px-2.5 py-1.5 rounded-lg select-all focus:outline-none"
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={handleCopy}
                className="h-8 w-8 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>

            <Button 
              onClick={handleWhatsAppShare}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs h-9 font-medium"
            >
              Share via WhatsApp
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
