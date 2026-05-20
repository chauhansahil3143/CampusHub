"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Book, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export default function UnifiedUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "notes"; // default to notes
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Common fields
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [description, setDescription] = useState("");

  // Book specific fields
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");

  // PYQ specific fields
  const [year, setYear] = useState("");

  // Clear fields when type changes
  useEffect(() => {
    setTitle("");
    setSubject("");
    setSemester("");
    setBranch("");
    setDescription("");
    setAuthor("");
    setCategory("");
    setYear("");
    setFile(null);
    setError(null);
    setSuccess(false);
  }, [type]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file to upload.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to upload material.");

      // 1. Upload File to Storage (using notes bucket for simplicity, it's public)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, file, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('notes')
        .getPublicUrl(filePath);

      // 3. Save to Database based on type
      let dbError = null;

      if (type === "notes") {
        const { error } = await supabase
          .from("notes")
          .insert({
            title,
            description,
            subject,
            semester: parseInt(semester),
            branch,
            pdf_url: publicUrl,
            uploaded_by: user.id
          });
        dbError = error;
      } else if (type === "books") {
        const { error } = await supabase
          .from("books")
          .insert({
            title,
            author,
            category,
            description,
            pdf_url: publicUrl,
            uploaded_by: user.id
          });
        dbError = error;
      } else if (type === "pyqs") {
        const { error } = await supabase
          .from("pyqs")
          .insert({
            subject,
            year: parseInt(year),
            semester: parseInt(semester),
            branch,
            pdf_url: publicUrl,
            uploaded_by: user.id
          });
        dbError = error;
      }

      if (dbError) throw dbError;

      setSuccess(true);
      setTimeout(() => {
        router.push(`/study-material?tab=${type}`);
        router.refresh();
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Upload {type === "notes" ? "Notes" : type === "books" ? "Book" : "PYQ"}</h1>
          <p className="text-muted-foreground">Share academic files with your campus community.</p>
        </div>
        <Link href={`/study-material?tab=${type}`} className="text-sm font-medium text-primary hover:underline">
          Back to Study Material
        </Link>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Fill out the fields below to contribute.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Uploaded successfully! Redirecting...</span>
              </div>
            )}

            {/* Note Specific Form */}
            {type === "notes" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Note Title</label>
                  <Input 
                    placeholder="e.g. Lecture 1: Big O Notation" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input 
                    placeholder="e.g. Analysis of Algorithms" 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch</label>
                  <Input 
                    placeholder="e.g. Computer Science" 
                    value={branch} 
                    onChange={e => setBranch(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semester (Number)</label>
                  <Input 
                    type="number"
                    min="1"
                    max="8"
                    placeholder="e.g. 4" 
                    value={semester} 
                    onChange={e => setSemester(e.target.value)} 
                    required 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px] md:text-sm"
                    placeholder="Provide a brief outline of the topics covered..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Book Specific Form */}
            {type === "books" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Book Title</label>
                  <Input 
                    placeholder="e.g. Introduction to Algorithms" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Author(s)</label>
                  <Input 
                    placeholder="e.g. Thomas H. Cormen" 
                    value={author} 
                    onChange={e => setAuthor(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input 
                    placeholder="e.g. Computer Science Reference" 
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    required 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px] md:text-sm"
                    placeholder="Provide details about the book..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* PYQ Specific Form */}
            {type === "pyqs" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input 
                    placeholder="e.g. Digital Logic Design" 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Exam Year</label>
                  <Input 
                    type="number"
                    min="2000"
                    max="2030"
                    placeholder="e.g. 2023" 
                    value={year} 
                    onChange={e => setYear(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch / Department</label>
                  <Input 
                    placeholder="e.g. Electronics & Communication" 
                    value={branch} 
                    onChange={e => setBranch(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semester (Number)</label>
                  <Input 
                    type="number"
                    min="1"
                    max="8"
                    placeholder="e.g. 3" 
                    value={semester} 
                    onChange={e => setSemester(e.target.value)} 
                    required 
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">PDF File</label>
              <div className="border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center justify-center bg-muted/20 transition-colors hover:bg-muted/40">
                <input 
                  type="file" 
                  accept="application/pdf"
                  className="hidden" 
                  id="file-upload"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-lg">Click to browse</span>
                  <span className="text-muted-foreground text-sm mt-1">PDF files only (Max 50MB)</span>
                  
                  {file && (
                    <div className="mt-4 p-3 bg-background rounded-lg border border-border/50 flex items-center gap-3 w-full max-w-xs">
                      {type === "notes" ? (
                        <FileText className="w-5 h-5 text-red-500" />
                      ) : type === "books" ? (
                        <Book className="w-5 h-5 text-red-500" />
                      ) : (
                        <FileSpreadsheet className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]" disabled={loading}>
              {loading ? "Uploading..." : `Upload ${type === "notes" ? "Notes" : type === "books" ? "Book" : "PYQ"}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
