"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, MessageSquare, User } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Library", href: "/study-material", icon: BookOpen },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-background/70 backdrop-blur-xl border border-border px-6 py-2.5 rounded-2xl flex justify-between items-center shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const Icon = link.icon;

        return (
          <Link 
            key={link.name} 
            href={link.href}
            className="flex flex-col items-center justify-center relative py-1 px-3 group"
          >
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${
              isActive 
                ? "text-primary bg-primary/10 scale-110" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] mt-0.5 font-medium transition-all ${
              isActive ? "text-primary opacity-100" : "text-muted-foreground opacity-80"
            }`}>
              {link.name}
            </span>

            {/* Glowing dot for active page */}
            {isActive && (
              <span className="absolute -top-1 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
