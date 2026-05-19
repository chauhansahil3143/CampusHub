"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Notes", href: "/notes" },
    { name: "PYQs", href: "/pyqs" },
    { name: "Books", href: "/books" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:to-primary transition-all">
              CampusHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4 border-l border-border/50 pl-6">
              <Link href="/login" className={buttonVariants({ variant: "ghost", className: "hover:bg-muted/50 rounded-full" })}>
                Log in
              </Link>
              <Link href="/signup" className={buttonVariants({ className: "rounded-full shadow-md shadow-primary/20 transition-transform hover:scale-105" })}>
                Sign up
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border/50 overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-foreground py-2 border-b border-border/50"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-4">
                <Link href="/login" onClick={() => setIsOpen(false)} className={buttonVariants({ variant: "outline", className: "w-full justify-center h-12 rounded-xl" })}>Log in</Link>
                <Link href="/signup" onClick={() => setIsOpen(false)} className={buttonVariants({ className: "w-full justify-center h-12 rounded-xl" })}>Sign up</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
