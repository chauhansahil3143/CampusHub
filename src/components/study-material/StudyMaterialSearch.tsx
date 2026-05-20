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
    <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input 
          type="text" 
          placeholder={placeholderText}
          className="pl-10 h-12 rounded-xl bg-card/40 backdrop-blur-md border border-border hover:border-primary/20 focus:border-primary/50 text-base transition-all duration-300"
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
            className="w-full h-12 pl-4 pr-10 rounded-xl bg-card/40 backdrop-blur-md border border-border text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 hover:border-primary/20 transition-all duration-300 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[size:10px_auto] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a855f7%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] text-left cursor-pointer"
          >
            <option value="" className="bg-card text-foreground">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s} className="bg-card text-foreground">Semester {s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Subject/Category Filter */}
      <div className="w-full md:w-56">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full h-12 pl-4 pr-10 rounded-xl bg-card/40 backdrop-blur-md border border-border text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 hover:border-primary/20 transition-all duration-300 capitalize appearance-none bg-no-repeat bg-[right_1rem_center] bg-[size:10px_auto] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a855f7%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] text-left cursor-pointer"
        >
          <option value="" className="bg-card text-foreground">
            All {activeTab === "books" ? "Categories" : "Subjects"}
          </option>
          {filterList.map((item) => (
            <option key={item} value={item} className="bg-card text-foreground capitalize">
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
