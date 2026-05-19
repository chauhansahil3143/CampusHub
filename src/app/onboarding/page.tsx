"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Upload, CheckCircle2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if already onboarded
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("users").select("semester").eq("id", user.id).single();
        if (data?.semester) {
          router.push("/dashboard");
        }
      }
    };
    checkUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      let avatar_url = null;

      // Upload Avatar if selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}_avatar_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        avatar_url = publicUrl;
      }

      // Update User Profile
      const updateData: any = {
        semester: parseInt(semester),
        branch,
      };
      if (avatar_url) updateData.avatar_url = avatar_url;

      const { error: dbError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (dbError) throw dbError;

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>Tell us a bit about yourself so we can personalize your CampusHub experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-500/10 text-green-600 rounded-lg flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Profile saved! Redirecting...</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Photo (Optional)</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-border overflow-hidden">
                  {file ? (
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Branch / Department</label>
              <Input 
                placeholder="e.g. Computer Engineering" 
                value={branch} 
                onChange={e => setBranch(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Current Semester</label>
              <Input 
                type="number" 
                min="1" 
                max="10" 
                placeholder="e.g. 5" 
                value={semester} 
                onChange={e => setSemester(e.target.value)} 
                required 
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save and Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
