"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Sparkles, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            CampusHub
          </span>
        </Link>

        <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-xl shadow-primary/5">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email and we will send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm flex items-start gap-3 border border-green-500/20">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                  <span>Check your email for a password reset link. It might take a few minutes to arrive.</span>
                </div>
                <Link href="/login" className={buttonVariants({ className: "w-full" })}>
                  Return to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="student@college.edu" 
                      className="pl-9 bg-background/50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? "Sending link..." : "Send reset link"}
                </Button>
              </form>
            )}

            {!success && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
