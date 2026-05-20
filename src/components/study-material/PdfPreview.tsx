"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface PdfPreviewProps {
  url: string;
  title: string;
}

export default function PdfPreview({ url, title }: PdfPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="w-full h-full relative overflow-hidden select-none bg-background flex items-center justify-center">
      {/* Loading Skeleton & Spinner */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-card to-background p-4 flex flex-col justify-between z-10">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center border-b border-border/30 pb-2">
            <div className="h-2 bg-primary/10 rounded-full w-20 animate-pulse"></div>
            <div className="h-2 bg-muted rounded-full w-6 animate-pulse"></div>
          </div>
          
          {/* Content Lines & Spinning Loader */}
          <div className="space-y-2 my-2 flex-1 flex flex-col justify-center relative">
            {/* Spinning Loader Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 z-20 bg-background/40 backdrop-blur-[1px]">
              <div className="relative flex items-center justify-center">
                {/* Glow ring */}
                <div className="absolute w-8 h-8 rounded-full border border-primary/20 animate-ping"></div>
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
              <span className="text-[10px] text-muted-foreground/70 font-semibold tracking-wider uppercase animate-pulse">
                Previewing
              </span>
            </div>
            
            <div className="h-1.5 bg-primary/10 rounded-full w-4/5 animate-pulse"></div>
            <div className="h-1.5 bg-muted rounded-full w-11/12 animate-pulse"></div>
            <div className="h-1.5 bg-muted rounded-full w-2/3 animate-pulse"></div>
            <div className="h-1.5 bg-muted rounded-full w-3/4 animate-pulse"></div>
          </div>

          {/* Footer Skeleton */}
          <div className="flex justify-between items-center pt-2 border-t border-border/30">
            <div className="h-2 bg-muted rounded-full w-14 animate-pulse"></div>
            <div className="h-2 bg-muted rounded-full w-8 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* PDF Iframe */}
      <iframe 
        src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`} 
        className={`w-[110%] h-[160%] absolute -top-[5%] -left-[5%] border-none pointer-events-none origin-top transition-all duration-700 ease-out ${
          isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
        title={title}
        onLoad={() => setIsLoading(false)}
      />
      <div className="absolute inset-0 bg-transparent" />
    </div>
  );
}
