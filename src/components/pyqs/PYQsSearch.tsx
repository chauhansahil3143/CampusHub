"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

export default function PYQsSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      startTransition(() => {
        if (query) {
          router.push(`/pyqs?q=${encodeURIComponent(query)}`);
        } else {
          router.push(`/pyqs`);
        }
      });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router]);

  return (
    <div className="relative max-w-xl mb-10">
      <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
      <Input 
        type="text" 
        placeholder="Search by subject or branch..." 
        className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 text-base"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isPending && <span className="absolute right-3 top-3 text-xs text-muted-foreground">Searching...</span>}
    </div>
  );
}
