import { Loader2, Sparkles } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>

      <div className="flex flex-col items-center justify-center space-y-6 max-w-sm text-center">
        {/* Animated Loading Ring & Icon */}
        <div className="relative flex items-center justify-center">
          {/* Animated concentric rings */}
          <div className="absolute w-20 h-20 rounded-full border-2 border-primary/20 border-t-primary border-r-primary/40 animate-spin [animation-duration:1.5s]"></div>
          <div className="absolute w-16 h-16 rounded-full border-2 border-indigo-500/10 border-b-indigo-500 border-l-indigo-500/30 animate-spin [animation-duration:1s] [animation-direction:reverse]"></div>
          <div className="absolute w-24 h-24 rounded-full border border-dashed border-muted-foreground/15 animate-spin [animation-duration:6s]"></div>
          
          {/* Central glowing icon */}
          <div className="w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center shadow-lg shadow-primary/5">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent animate-pulse">
            CampusHub
          </h3>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest animate-pulse [animation-duration:1.5s]">
            Fetching latest updates...
          </p>
        </div>

        {/* Skeleton content layout representation */}
        <div className="w-48 space-y-2.5 pt-4">
          <div className="h-1.5 bg-muted rounded-full w-full animate-pulse"></div>
          <div className="h-1.5 bg-muted/65 rounded-full w-5/6 mx-auto animate-pulse [animation-delay:0.2s]"></div>
          <div className="h-1.5 bg-muted/40 rounded-full w-2/3 mx-auto animate-pulse [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  );
}
