"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Leaf, Map, ShieldCheck, Handshake, LineChart, ArrowRight, Mail, X as XIcon, Sprout } from "lucide-react";


const LOCATIONS = [
  { name: "Kenya", detail: "Uasin Gishu • Kiambu • Elgeyo‑Marakwet" },
  { name: "Germany", detail: "NRW (Herne/Bochum) • EU buyer hub" },
  { name: "USA", detail: "Finance & buyer relations" },
] as const;

const Section = ({ children, id }: React.PropsWithChildren<{ id?: string }>) => (
  <section id={id} className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-20">{children}</section>
);

const Pill = ({ children }: React.PropsWithChildren) => (
  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ring-1 ring-[#DF8012]/30 bg-[#DF8012]/10 text-[#DF8012]">{children}</span>
);

function GifFrame({ src, alt, height = "h-72 md:h-96", motion = "anim-float" }: { src: string; alt: string; height?: string; motion?: string }) {
  return (
    <div className={`relative ${height} w-full rounded-2xl overflow-hidden border border-[#DF8012]/20 shadow-sm ${motion} will-change-transform transition-transform duration-500 hover:scale-[1.01]`}>
      <img src={src} alt={alt} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
    </div>
  );
}

export default function LandingPage_GSG() {
  return (
    <div className="w-full bg-[#0A1416]">
      <style jsx global>{`
        @keyframes floaty { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        @keyframes wiggle { 0%,100% { transform: rotate(0deg) } 50% { transform: rotate(-0.6deg) } }
        @keyframes drift { 0%,100% { transform: translateX(0) } 50% { transform: translateX(6px) } }
        .anim-float { animation: floaty 8s ease-in-out infinite; }
        .anim-wiggle { animation: wiggle 7s ease-in-out infinite; }
        .anim-drift { animation: drift 10s ease-in-out infinite; }
        .hero-gradient-text {
          background: linear-gradient(135deg, #DF8012 0%, #FFB84D 50%, #DF8012 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nature-tech-gradient {
          background: linear-gradient(135deg, #0A1416 0%, #1A2A2A 25%, #0A1416 50%, #2A1A0A 75%, #0A1416 100%);
        }
      `}</style>

      {/* HERO (Text left • GIF right) */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs text-white/70 flex-wrap">
              <Pill><Sprout className="h-3.5 w-3.5"/> Farmer‑led</Pill>
              <Pill><ShieldCheck className="h-3.5 w-3.5"/> Traceable</Pill>
              <Pill><Leaf className="h-3.5 w-3.5"/> Sustainable</Pill>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight hero-gradient-text">
              From our fields to your table — naturally, transparently, globally.
            </h1>
            <p className="text-lg text-white/80 max-w-2xl">
              We produce, pack, grade, and move fresh produce with care. Face‑to‑face with buyers in Kenya, the EU, and the US.
              Predictable pricing, reliable sourcing, and flexible services like lot/harvest/farm allocation and early‑purchase discounts.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-xl text-base px-6 py-3 bg-[#DF8012] hover:bg-[#DF8012]/90 text-white border-[#DF8012]"><a href="#farms">Explore our farms <ArrowRight className="h-5 w-5"/></a></Button>
              <Button asChild variant="secondary" className="rounded-xl border-[#DF8012]/30 text-base px-6 py-3 bg-transparent hover:bg-[#DF8012]/10 text-[#DF8012]"><a href="#trace">Trace a lot <Map className="h-5 w-5"/></a></Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <GifFrame src="/hero.gif" alt="Hero — NDVI overlays / harvest highlights" motion="anim-float" />
          </div>
        </div>
      </Section>

      <Separator className="bg-[#DF8012]/20"/>

      {/* ABOUT (GIF left • Text right) */}
      <Section id="about">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="order-2 md:order-1">
            <GifFrame src="/about.gif" alt="About — farm and team montage" motion="anim-wiggle" />
          </div>
          <div className="space-y-4 order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Farmers first. Tech that serves the soil.</h2>
            <p className="text-lg text-white/80">
              We grow on our own plots and alongside partner farmers to deliver consistent, natural quality. Our tech — sensors,
              satellite cues, and compliance rails — supports the basics: better planning, fewer surprises, cleaner audits.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/10 border border-white/15">GlobalG.A.P path</Badge>
              <Badge className="bg-white/10 border border-white/15">Cold‑chain discipline</Badge>
              <Badge className="bg-white/10 border border-white/15">Soon: Carbon‑neutral</Badge>
            </div>
          </div>
        </div>
      </Section>

      {/* WHAT WE DO (static cards) */}
      <Section id="model">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">What we offer</h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/5 border-white/10 rounded-2xl p-6"><div className="flex flex-col gap-2"><div className="flex items-center gap-2 font-medium"><Leaf className="h-5 w-5"/> Own farms</div><p className="text-white/80">Hands‑on quality from seed to harvest; humble scale, growing with demand.</p></div></Card>
          <Card className="bg-white/5 border-white/10 rounded-2xl p-6"><div className="flex flex-col gap-2"><div className="flex items-center gap-2 font-medium"><Handshake className="h-5 w-5"/> Partner network</div><p className="text-white/80">Farmer partnerships for volume and variety — shared protocols, shared wins.</p></div></Card>
          <Card className="bg-white/5 border-white/10 rounded-2xl p-6"><div className="flex flex-col gap-2"><div className="flex items-center gap-2 font-medium"><ShieldCheck className="h-5 w-5"/> Traceability</div><p className="text-white/80">Lot/harvest/farm allocation on request; audit‑ready documentation.</p></div></Card>
          <Card className="bg-white/5 border-white/10 rounded-2xl p-6"><div className="flex flex-col gap-2"><div className="flex items-center gap-2 font-medium"><LineChart className="h-5 w-5"/> Early‑buy options</div><p className="text-white/80">Purchase early for discounts; predictable lanes and volumes.</p></div></Card>
        </div>
      </Section>

      {/* TRACEABILITY (GIF left • Text right) */}
      <Section id="trace">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 space-y-5">
            <GifFrame src="/trace.gif" alt="Traceability — lots, labels, temperature curve" motion="anim-drift" />
          </div>
          <div className="space-y-5 order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Trace a Lot — transparency you can click</h2>
            <p className="text-lg text-white/80">Cold‑chain temperatures, custody docs, compliance badges. Our buyers scan a code and see the journey, end‑to‑end.</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-xl px-6 py-3 text-base"><a href="/trace">Open Trace Dashboard <ArrowRight className="h-5 w-5"/></a></Button>
              <Button asChild variant="secondary" className="rounded-xl border-white/20 px-6 py-3 text-base"><a href="/investors">Investor Console <ArrowRight className="h-5 w-5"/></a></Button>
            </div>
          </div>
        </div>
      </Section>

      {/* WHERE WE GROW (text grid + GIF below) */}
      <Section id="farms">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Where we grow</h2>
        <p className="mt-3 text-lg text-white/80">We start in East Africa and bridge to EU & US buyers with measurable quality.</p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {LOCATIONS.map(loc => (
            <div key={loc.name} className="bg-white/5 border-white/10 rounded-2xl p-6">
              <div className="text-sm font-medium">{loc.name}</div>
              <div className="text-xs text-white/70 mt-1">{loc.detail}</div>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <GifFrame src="/farms.gif" alt="Where we grow — montage" motion="anim-float" />
        </div>
      </Section>

      {/* FOOTER */}
      <footer id="contact" className="mt-10 border-t border-white/10">
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            <div>
              <div className="text-lg font-semibold tracking-tight">Grow with us—sustainably, boldly, globally.</div>
              <p className="mt-2 text-sm text-white/70">Humble roots, disciplined quality, clear traceability. We build trust crop by crop.</p>
            </div>
            <div>
              <div className="text-sm font-medium">Locations</div>
              <div className="mt-2 text-sm text-white/80">Kenya • USA • Germany</div>
            </div>
            <div>
              <div className="text-sm font-medium">Contact</div>
              <div className="mt-2 flex flex-col gap-2 text-sm">
                <a href="mailto:friends@greenstemglobal.com" className="inline-flex items-center gap-2 text-white/80 hover:text-white"><Mail className="h-4 w-4"/> friends@greenstemglobal.com</a>
                <a href="https://x.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-white/80 hover:text-white"><XIcon className="h-4 w-4"/> X (Twitter)</a>
              </div>
            </div>
          </div>
          <div className="mt-10 text-xs text-white/50">© {new Date().getFullYear()} GreenStemGlobal. All rights reserved.</div>
        </Section>
      </footer>
    </div>
  );
}
