"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, MessageSquare, Upload, Users, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full opacity-50 mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-blue-500/20 blur-[100px] rounded-full opacity-50 mix-blend-screen"></div>

        <div className="container px-4 md:px-6 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary backdrop-blur-md">
              <Sparkles className="w-4 h-4 mr-2" />
              The #1 Platform for College Students
            </Badge>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70"
          >
            Your Ultimate Academic <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              Command Center
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Access top-tier notes from seniors, chat with your branch, solve PYQs, and collaborate seamlessly. CampusHub is where academic success happens.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/signup" className={buttonVariants({ size: "lg", className: "h-12 px-8 rounded-full shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)] transition-all hover:scale-105" })}>
              Get Started Now <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link href="/notes" className={buttonVariants({ size: "lg", variant: "outline", className: "h-12 px-8 rounded-full border-border/50 backdrop-blur-sm transition-all hover:bg-muted/50" })}>
              Explore Notes
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30 border-y border-border/50 relative">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to ace your semesters</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We've built all the tools required for a modern college student to excel academically and socially.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BookOpen className="w-6 h-6 text-blue-500" />}
              title="Verified Notes & PYQs"
              description="Access hundreds of high-quality notes and past year questions uploaded by verified seniors."
              delay={0.1}
            />
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6 text-purple-500" />}
              title="Realtime Branch Chat"
              description="Connect with your peers instantly. Discuss assignments, share resources, and help each other out."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Upload className="w-6 h-6 text-green-500" />}
              title="Contribute & Earn"
              description="Upload your own notes and books. Help juniors out and build your profile reputation."
              delay={0.3}
            />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border/50 bg-background py-12">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">CampusHub</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 CampusHub. Built for students, by students.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="p-8 rounded-3xl bg-background border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
    >
      <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
