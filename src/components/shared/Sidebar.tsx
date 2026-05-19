"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Home, User, BookOpen, MessageSquare, Sparkles, Book, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Study Material", href: "/study-material", icon: BookOpen },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <aside className="w-full md:w-64 bg-background border-r border-border/50 p-6 flex flex-col h-screen sticky top-0 shrink-0">
      <Link href="/dashboard" className="flex items-center gap-2 mb-8 group">
        <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
          CampusHub
        </span>
      </Link>
      
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link 
              key={link.name}
              href={link.href} 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" /> {link.name}
            </Link>
          );
        })}
      </nav>

      <Button 
        variant="ghost" 
        className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-auto"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5 mr-3" />
        Logout
      </Button>
    </aside>
  );
}
