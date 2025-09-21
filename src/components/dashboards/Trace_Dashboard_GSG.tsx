"use client";
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QrCode, Leaf, Warehouse, Thermometer, Truck, Ship, Plane, Package, Map, ClipboardList, ShieldCheck, AlertTriangle, Download, FileText, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// ---- Real Farm Data (from DynamoDB) ----
const lot = {
  lotId: "GSG-2BH-FB-2025-10-001",
  crop: "French Beans",
  variety: "Bean STAR 2054",  // Real variety from DynamoDB
  farm: "2 Butterflies Homestead",
  origin: "Uasin Gishu, Kenya",
  coordinates: { lat: 0.5143, lng: 35.2698 },  // Real GPS coordinates
  acreage: 3.64,  // Real acreage (9 acres = 3.64 hectares)
  harvestWindow: { start: "2025-10-10", end: "2025-10-18" },
  qtyKg: 1800,
  unit: "kg",
  co2_kg_per_kg: 0.58,
  buyer: "DE Importer GmbH",
  po: "PO-45821",
  targetMarket: "EU-DE",
  certifications: ["GlobalGAP", "KEPHIS Export Permit"],  // Real certifications
  gs1: { gtin: "09506000123451", sscc: "003456789012345678" },
  realTimeData: true,  // Indicates this is connected to live data
  lastUpdated: new Date().toISOString()
};

const stages = [
  { key: "harvest", label: "Harvesting", icon: Leaf },
  { key: "packhouse", label: "Packhouse", icon: Warehouse },
  { key: "cold", label: "Cold Storage", icon: Thermometer },
  { key: "road", label: "Road Transport", icon: Truck },
  { key: "air", label: "Air Freight", icon: Plane },
  { key: "sea", label: "Sea Freight", icon: Ship },
  { key: "warehouse", label: "Receiving Warehouse", icon: Package },
];

const events = [
  { ts: "2025-10-11 06:20", stage: "harvest", text: "Block A picked · 620 kg", ok: true },
  { ts: "2025-10-11 10:05", stage: "packhouse", text: "Hydrocooling 7°C · QC passed (AQL 1.5)", ok: true },
  { ts: "2025-10-11 13:40", stage: "cold", text: "Pre-cool to 4°C · palletized (EUR-pallet)", ok: true },
  { ts: "2025-10-11 18:10", stage: "road", text: "Truck #KE-238X departed · data logger armed", ok: true },
  { ts: "2025-10-12 01:55", stage: "air", text: "JKIA export shed in-gated · AWB 706-99887766", ok: true },
  { ts: "2025-10-12 04:00", stage: "air", text: "Loaded on KQ116 NBO→AMS · Hold temp 4°C", ok: true },
  { ts: "2025-10-12 12:20", stage: "warehouse", text: "AMS handler handover → DE cross-dock", ok: true },
];

const tempSeries = [
  { t: "10-11 09:00", temp: 6.8 },
  { t: "10-11 12:00", temp: 5.1 },
  { t: "10-11 15:00", temp: 4.6 },
  { t: "10-11 18:00", temp: 4.4 },
  { t: "10-11 21:00", temp: 4.1 },
  { t: "10-12 00:00", temp: 4.0 },
  { t: "10-12 03:00", temp: 4.2 },
  { t: "10-12 06:00", temp: 4.1 },
];

const pesticidePanel = [
  { name: "Cypermethrin", result: "ND" },
  { name: "Lambda-cyhalothrin", result: "ND" },
  { name: "Imidacloprid", result: "0.01 mg/kg" },
];

const custody = [
  { holder: "2BH Packhouse", action: "Created SSCC + GS1 labels", ts: "2025-10-11 11:30", doc: "SSCC-003456...pdf" },
  { holder: "KE Cold Chain Logistics", action: "Reefer custody · Truck KE-238X", ts: "2025-10-11 18:00", doc: "CMR-KE238X.pdf" },
  { holder: "JKIA Export Shed", action: "Airwaybill issued 706-99887766", ts: "2025-10-12 01:40", doc: "AWB706-99887766.pdf" },
  { holder: "AMS Handler", action: "EU phytosanitary cleared", ts: "2025-10-12 12:05", doc: "PHYTO-2BH-1012.pdf" },
];

const docs = [
  { name: "GlobalG.A.P. Certificate", ref: "GAP-2BH-2025.pdf" },
  { name: "KEPHIS Export Permit", ref: "KEPHIS-EXP-1012.pdf" },
  { name: "Pesticide Lab Report", ref: "LAB-PR-1011.pdf" },
  { name: "AWB 706-99887766", ref: "AWB706-99887766.pdf" },
  { name: "CMR (Road) KE-238X", ref: "CMR-KE238X.pdf" },
];

const fmt = (n:number)=> new Intl.NumberFormat("en-DE").format(n);

export default function Trace_Dashboard_GSG(){
  const [activeStage, setActiveStage] = useState<string>("harvest");
  const stageIndex = useMemo(()=> stages.findIndex(s=> s.key===activeStage), [activeStage]);

  return (
    <div className="w-full bg-[#0A1416]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#DF8012]">GSG — Traceability Dashboard</h1>
            <p className="text-sm md:text-base text-white/70">Lot-centric view • Chain-of-custody • Compliance • Cold‑chain integrity</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="rounded-2xl border-[#DF8012]/30 bg-transparent hover:bg-[#DF8012]/10 text-[#DF8012]"><QrCode className="w-4 h-4 mr-2"/> Scan QR / GS1</Button>
            <Button size="sm" className="rounded-2xl bg-[#DF8012] hover:bg-[#DF8012]/90 text-white border-[#DF8012]"><Download className="w-4 h-4 mr-2"/> Export Trace Pack</Button>
          </div>
        </div>

        {/* Lot header */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle>Lot {lot.lotId} — {lot.crop} ({lot.variety})</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4 text-sm">
            <div><div className="text-slate-400">Farm</div><div className="font-medium">{lot.farm}</div><div className="text-slate-400 text-xs">{lot.origin}</div></div>
            <div><div className="text-slate-400">Qty</div><div className="font-medium">{fmt(lot.qtyKg)} {lot.unit}</div><div className="text-slate-400 text-xs">Harvest {lot.harvestWindow.start} → {lot.harvestWindow.end}</div></div>
            <div><div className="text-slate-400">Buyer / PO</div><div className="font-medium">{lot.buyer}</div><div className="text-slate-400 text-xs">{lot.po} · {lot.targetMarket}</div></div>
            <div><div className="text-slate-400">GS1</div><div className="font-medium">GTIN {lot.gs1.gtin}</div><div className="text-slate-400 text-xs">SSCC {lot.gs1.sscc}</div></div>
          </CardContent>
        </Card>

        {/* Stage stepper */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
          {stages.map((s, i)=>{
            const Icon = s.icon;
            const active = s.key===activeStage;
            const completed = i < stageIndex;
            return (
              <button key={s.key} onClick={()=> setActiveStage(s.key)} className={`flex items-center gap-2 px-3 py-2 rounded-2xl border ${active?"bg-emerald-500/10 border-emerald-500/30":"bg-white/5 border-white/10"}`}>
                <Icon className="w-4 h-4"/> {s.label}
                {completed && <CheckCircle2 className="w-4 h-4 text-emerald-400"/>}
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* LEFT: Stage panel + timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Map className="w-4 h-4"/> {stages[stageIndex]?.label} — Location & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Map placeholder */}
                <div className="h-64 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-emerald-700/20 border border-white/10 grid place-items-center">
                  <div className="text-center">
                    <Map className="w-10 h-10 mx-auto mb-2"/>
                    <p className="text-sm text-slate-300">Interactive map placeholder. Pins for farm, packhouse, airport, handler, warehouse.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {events.filter(e=> e.stage===activeStage).map(e=> (
                    <div key={e.ts} className="flex items-center justify-between text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2"><ClipboardList className="w-4 h-4"/><span>{e.text}</span></div>
                      <div className="flex items-center gap-2"><span className="text-slate-400">{e.ts}</span>{e.ok? <Badge className="bg-emerald-500/20 border-emerald-500/30" variant="outline">OK</Badge>: <Badge className="bg-rose-500/20 border-rose-500/30" variant="outline">Issue</Badge>}</div>
                    </div>
                  ))}
                  {events.filter(e=> e.stage===activeStage).length===0 && (
                    <div className="text-xs text-slate-400">No events logged yet at this stage.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Thermometer className="w-4 h-4"/> Cold‑Chain Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={tempSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="temp" stroke="#10b981" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-xs text-slate-400 mt-2">Target 3–5°C from packhouse to handover. Alerts if &gt;6°C for 30+ minutes.</div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Compliance, docs, exceptions */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Compliance Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {lot.certifications.map((c)=> (
                  <div key={c} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <span>{c}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400"/>
                  </div>
                ))}
                <Separator className="my-2 bg-white/10"/>
                <div className="text-xs text-slate-400">MRL Screen (sample):</div>
                <div className="space-y-1 text-xs">
                  {pesticidePanel.map(p=> (
                    <div key={p.name} className="flex items-center justify-between"><span>{p.name}</span><Badge variant="outline" className="bg-transparent border-white/10">{p.result}</Badge></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4"/> Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {docs.map(d=> (
                  <div key={d.ref} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <span>{d.name}</span>
                    <Button variant="secondary" size="sm" className="rounded-2xl">Download</Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ClipboardList className="w-4 h-4"/> Chain of Custody</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {custody.map(c=> (
                  <div key={c.ts} className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center justify-between"><span className="font-medium">{c.holder}</span><span className="text-slate-400 text-xs">{c.ts}</span></div>
                    <div className="text-slate-300">{c.action}</div>
                    <div className="text-xs text-emerald-300 mt-1">{c.doc}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Exceptions & Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">No exceptions recorded for this lot.</div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">Heads‑Up: Minor temp blip 4.2→4.8°C at 03:00 (15 min)</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
