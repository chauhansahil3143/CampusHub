"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MobileHeader() {
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="md:hidden sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="bg-primary/10 p-1.5 rounded-lg">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
          CampusHub
        </span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Avatar className="h-8 w-8 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {profile?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "CH"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 mt-1.5 rounded-xl border border-border bg-popover/90 backdrop-blur-md">
          <DropdownMenuItem 
            className="focus:bg-muted flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/profile")}
          >
            <User className="w-4 h-4 text-muted-foreground" />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleLogout}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
