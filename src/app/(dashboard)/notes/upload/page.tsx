"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, FileType, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function UploadNotePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
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
      if (!user) throw new Error("You must be logged in to upload notes.");

      // 1. Upload File to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('notes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('notes')
        .getPublicUrl(filePath);

      // 3. Save to Database
      const { error: dbError } = await supabase
        .from('notes')
        .insert({
          title,
          description,
          subject,
          branch,
          semester: parseInt(semester),
          pdf_url: publicUrl,
          uploaded_by: user.id
        });

      if (dbError) throw dbError;

      setSuccess(true);
      setTimeout(() => {
        router.push("/notes");
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
        <h1 className="text-3xl font-bold mb-2">Upload Notes</h1>
        <p className="text-muted-foreground">Share your knowledge with juniors. Help the community grow!</p>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle>Note Details</CardTitle>
          <CardDescription>Provide accurate information so others can find your notes easily.</CardDescription>
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
                <span>Notes uploaded successfully! Redirecting...</span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input 
                  placeholder="e.g. Data Structures Unit 1" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input 
                  placeholder="e.g. DS & Algorithms" 
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
                  placeholder="e.g. 3" 
                  value={semester} 
                  onChange={e => setSemester(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[100px]"
                placeholder="Briefly describe what topics are covered..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
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
                      <FileType className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Notes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
