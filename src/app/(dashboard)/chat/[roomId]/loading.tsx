import { Hash } from "lucide-react";

export default function ChatRoomLoading() {
  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden h-full">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center animate-pulse">
            <Hash className="w-4 h-4 text-primary/40" />
          </div>
          <div className="h-4 bg-muted rounded-full w-28 animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted animate-pulse"></div>
          <div className="w-8 h-8 rounded-lg bg-muted animate-pulse"></div>
        </div>
      </div>

      {/* Messages Skeleton List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Message 1 (Left side) */}
        <div className="flex items-start gap-3 max-w-[70%]">
          <div className="w-8 h-8 rounded-full bg-muted shrink-0 animate-pulse"></div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <div className="h-3 bg-muted rounded-full w-16 animate-pulse"></div>
              <div className="h-2 bg-muted/60 rounded-full w-10 animate-pulse"></div>
            </div>
            <div className="h-9 bg-card border border-border/50 rounded-2xl rounded-tl-none p-3 w-48 animate-pulse"></div>
          </div>
        </div>

        {/* Message 2 (Right side) */}
        <div className="flex items-start gap-3 max-w-[70%] ml-auto flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-primary/10 shrink-0 animate-pulse"></div>
          <div className="space-y-2 flex-1 flex flex-col items-end">
            <div className="flex items-center gap-2 flex-row-reverse">
              <div className="h-3 bg-primary/15 rounded-full w-20 animate-pulse"></div>
              <div className="h-2 bg-muted/60 rounded-full w-10 animate-pulse"></div>
            </div>
            <div className="h-14 bg-primary/5 border border-primary/10 rounded-2xl rounded-tr-none p-3 w-64 animate-pulse"></div>
          </div>
        </div>

        {/* Message 3 (Left side) */}
        <div className="flex items-start gap-3 max-w-[70%]">
          <div className="w-8 h-8 rounded-full bg-muted shrink-0 animate-pulse"></div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <div className="h-3 bg-muted rounded-full w-24 animate-pulse"></div>
              <div className="h-2 bg-muted/60 rounded-full w-12 animate-pulse"></div>
            </div>
            <div className="space-y-1.5 bg-card border border-border/50 rounded-2xl rounded-tl-none p-3 w-72 animate-pulse">
              <div className="h-2 bg-muted rounded-full w-full"></div>
              <div className="h-2 bg-muted rounded-full w-4/5"></div>
            </div>
          </div>
        </div>

        {/* Message 4 (Right side) */}
        <div className="flex items-start gap-3 max-w-[70%] ml-auto flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-primary/10 shrink-0 animate-pulse"></div>
          <div className="space-y-2 flex-1 flex flex-col items-end">
            <div className="flex items-center gap-2 flex-row-reverse">
              <div className="h-3 bg-primary/15 rounded-full w-16 animate-pulse"></div>
              <div className="h-2 bg-muted/60 rounded-full w-10 animate-pulse"></div>
            </div>
            <div className="h-9 bg-primary/5 border border-primary/10 rounded-2xl rounded-tr-none p-3 w-40 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Input Box Skeleton */}
      <div className="p-4 border-t border-border/50 bg-background/50">
        <div className="flex gap-2">
          <div className="h-10 bg-muted rounded-xl flex-1 animate-pulse"></div>
          <div className="w-10 h-10 bg-primary/20 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
