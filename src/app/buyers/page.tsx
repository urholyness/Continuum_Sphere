"use client";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Trace_Dashboard_GSG from "@/components/dashboards/Trace_Dashboard_GSG";
export default function BuyersPage(){
  return (
    <div className="min-h-screen w-full bg-[#0B0F10] text-white">
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-semibold">Buyers — quality you can trace</h1>
        <p className="mt-2 text-white/70 max-w-3xl">We produce, pack, grade, and ship with discipline. Scan a code or open a lot to see custody, cold‑chain, and docs.</p>
        <div className="mt-4 flex items-center gap-3">
          <Button asChild className="rounded-xl"><a href="/trace">Open Trace Dashboard</a></Button>
          <Button asChild variant="secondary" className="rounded-xl border-white/20"><a href="/contact">Talk to us</a></Button>
        </div>
      </section>
      <Separator className="bg-white/10"/>
      {/* Embedded quickview (demo) */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <Trace_Dashboard_GSG/>
      </section>
    </div>
  );
}