"use client";

import { usePathname } from "next/navigation";

export default function ChatLayoutContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Match path /chat/[roomId] but not /chat itself
  const isChatRoom = /^\/chat\/[a-zA-Z0-9-]+$/.test(pathname);

  return (
    <div className={`fixed inset-x-0 top-[57px] ${isChatRoom ? "bottom-0" : "bottom-[88px]"} md:relative md:inset-auto md:w-full md:h-full flex overflow-hidden bg-background`}>
      {children}
    </div>
  );
}
