"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

export default function StudyMaterialSearch({ 
  activeTab, 
  subjects = [],
  categories = []
}: { 
  activeTab: string;
  subjects: string[];
  categories: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sem, setSem] = useState(searchParams.get("sem") || "");
  const [subject, setSubject] = useState(searchParams.get("subject") || "");

  // Sync state with URL params on navigation/tab switch
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setSem(searchParams.get("sem") || "");
    setSubject(searchParams.get("subject") || "");
  }, [activeTab, searchParams]);

  // Debounced URL updates when values change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams();
        params.set("tab", activeTab);
        
        if (query) params.set("q", query);
        
        // Semester & Subject apply only to Notes and PYQs
        if (activeTab !== "books") {
          if (sem) params.set("sem", sem);
          if (subject) params.set("subject", subject);
        } else {
          // Category applies only to Books
          if (subject) params.set("subject", subject);
        }

        router.push(`/study-material?${params.toString()}`);
      });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, sem, subject, activeTab, router]);

  const placeholderText = activeTab === "notes"
    ? "Search notes by title or description..."
    : activeTab === "books"
    ? "Search books by title or author..."
    : "Search PYQs by subject or branch...";

  const showSemesterFilter = activeTab === "notes" || activeTab === "pyqs";
  const filterList = activeTab === "books" ? categories : subjects;

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-10 items-stretch md:items-center">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input 
          type="text" 
          placeholder={placeholderText}
          className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Semester Filter */}
      {showSemesterFilter && (
        <div className="w-full md:w-44">
          <select
            value={sem}
            onChange={(e) => {
              setSem(e.target.value);
              setSubject(""); // Reset subject when semester changes since it might not apply
            }}
            className="w-full h-12 px-3 rounded-xl bg-muted/30 border border-border/50 text-foreground text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="" className="bg-background text-foreground">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s} className="bg-background text-foreground">Semester {s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Subject/Category Filter */}
      <div className="w-full md:w-56">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full h-12 px-3 rounded-xl bg-muted/30 border border-border/50 text-foreground text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring capitalize"
        >
          <option value="" className="bg-background text-foreground">
            All {activeTab === "books" ? "Categories" : "Subjects"}
          </option>
          {filterList.map((item) => (
            <option key={item} value={item} className="bg-background text-foreground capitalize">
              {item}
            </option>
          ))}
        </select>
      </div>

      {isPending && (
        <span className="text-xs text-muted-foreground self-center shrink-0">
          Updating...
        </span>
      )}
    </div>
  );
}
