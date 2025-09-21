"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

// Left side navigation (homepage links)
const LEFT_NAV = [
  { id: "about", label: "About", href: "/#about" },
  { id: "model", label: "What we do", href: "/#model" },
  { id: "farms", label: "Where we grow", href: "/#farms" },
  { id: "contact", label: "Contact", href: "/#contact" },
] as const;

// Right side navigation (main features)
const RIGHT_NAV = [
  { href: "/trace", label: "Sourcing/Trace" },
  { href: "/ff-fund", label: "F&F Fund" },
] as const;

interface GlobalNavProps {
  className?: string;
}

export default function GlobalNav({ className = "" }: GlobalNavProps) {
  return (
    <header className={`sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-[#0A1416]/70 border-b border-[#DF8012]/20 ${className}`}>
      <div className="max-w-7xl mx-auto h-16 px-6 md:px-8 flex items-center justify-between">
        {/* Left side: Logo + Home + Homepage links */}
        <div className="flex items-center gap-8">
          {/* Logo with Home link */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {/* GSG Name Logo */}
            <Image 
              src="/gsg-name-logo.png" 
              alt="GreenStem Global" 
              width={200}
              height={80}
              className="h-16 w-auto"
            />
          </Link>
          
          {/* Homepage navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm text-white/80">
            {LEFT_NAV.map(n => (
              <Link key={n.id} href={n.href} className="hover:text-white transition-colors">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side: Main features */}
        <div className="flex items-center gap-6">
          {/* Main feature links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
            {RIGHT_NAV.map(n => (
              <Link key={n.href} href={n.href} className="hover:text-white transition-colors font-medium">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
