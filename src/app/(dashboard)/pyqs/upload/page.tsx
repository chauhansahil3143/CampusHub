"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";

export default function UploadPYQPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file to upload.");
      return;
    }
    
    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to upload PYQs.");

      // 1. Upload File to Storage (using notes bucket or creating a pyqs bucket - we use notes bucket or books since books/notes public. Wait! Let's check schema: notes bucket is public.)
      // Actually we have public.notes bucket, public.books bucket. There is no pyq bucket. Let's use notes bucket for simplicity!
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('notes')
        .getPublicUrl(filePath);

      // 3. Save to Database
      const { error: dbError } = await supabase
        .from('pyqs')
        .insert({
          subject,
          year: parseInt(year),
          semester: parseInt(semester),
          branch,
          pdf_url: publicUrl,
          uploaded_by: user.id
        });

      if (dbError) throw dbError;

      setSuccess(true);
      setTimeout(() => {
        router.push("/pyqs");
        router.refresh();
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload PYQ</h1>
        <p className="text-muted-foreground">Share past exam papers to help peers prepare.</p>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle>Exam Paper Details</CardTitle>
          <CardDescription>Specify the subject, exam year, and semester.</CardDescription>
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
                <span>PYQ uploaded successfully! Redirecting...</span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input 
                  placeholder="e.g. Database Management Systems" 
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
                  placeholder="e.g. Information Technology" 
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
            </div>

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
                      <FileSpreadsheet className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload PYQ"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
