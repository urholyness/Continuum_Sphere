"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Leaf, Satellite, TrendingUp, DollarSign, Info, Map, Layers, ZoomIn, ZoomOut, Cloud, CalendarClock, LineChart, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";

// ==========================================================
// GreenStem — F&F Fund Console (Dashboard + Pro Map)
// Up-leveled to EOS-style: timeline scrubber, index selector (NDVI/NDMI/EVI),
// cloud filter, farm field polygons, right-side tabs (Crop info / Chart / Activities),
// investment block, and data integrity tests. No external map SDK used.
// ==========================================================

type Stage = "Field Planning" | "Harvesting" | "Packhouse" | "Cold-chain" | "In Transit" | "Arrival";

type IndexType = "NDVI" | "NDMI" | "EVI" | "RGB";

interface TimePoint { date: string; value: number; clouds?: number }

interface FarmSite {
  id: string;
  name: string;
  produce: "French Beans" | "Chili" | "Passion Fruit" | "Macadamia";
  variety: string;
  region: string;
  country: "KE";
  lat: number; // centroid
  lon: number;
  stage: Stage;
  labels: string[];
  mechanization: "Mechanized" | "Hand-harvest" | "Hybrid";
  families_impacted: number;
  production_tpw: number; // tons/week
  ndvi: number; // latest
  ndvi_trend: "up" | "down" | "flat";
  has_satellite: boolean;
  contractor_available: boolean;
  contract_status?: "Signed" | "Pending" | "None";
  investment: { funding_needed_usd: number; capex_usd?: number; opex_usd?: number; start_month: string; notes?: string };
  // NEW: field polygon + time series
  polygon: { lat: number; lon: number }[]; // simple ring
  timeseries: Record<IndexType, TimePoint[]>;
}

const FARMS: FarmSite[] = [
  {
    id: "2BH",
    name: "Two Butterflies Homestead",
    produce: "French Beans",
    variety: "Star 2008",
    region: "Uasin Gishu (Eldoret)",
    country: "KE",
    lat: 0.514,
    lon: 35.27,
    stage: "Harvesting",
    labels: ["Organic", "Non‑GMO"],
    mechanization: "Hand-harvest",
    families_impacted: 12,
    production_tpw: 2.0,
    ndvi: 0.74,
    ndvi_trend: "up",
    has_satellite: true,
    contractor_available: true,
    contract_status: "Signed",
    investment: { funding_needed_usd: 18000, capex_usd: 9000, opex_usd: 9000, start_month: "2025-10", notes: "Drip retrofit + field labor scaling" },
    polygon: [
      { lat: 0.5150, lon: 35.2688 },
      { lat: 0.5149, lon: 35.2704 },
      { lat: 0.5139, lon: 35.2706 },
      { lat: 0.5138, lon: 35.2690 },
    ],
    timeseries: mkSeries(0.65),
  },
  {
    id: "NOAH",
    name: "Noah's Joy",
    produce: "Passion Fruit",
    variety: "Purple",
    region: "Kiambu",
    country: "KE",
    lat: -1.17,
    lon: 36.83,
    stage: "In Transit",
    labels: ["GlobalG.A.P Path"],
    mechanization: "Hand-harvest",
    families_impacted: 7,
    production_tpw: 0.8,
    ndvi: 0.59,
    ndvi_trend: "flat",
    has_satellite: true,
    contractor_available: false,
    contract_status: "Pending",
    investment: { funding_needed_usd: 12000, capex_usd: 5000, opex_usd: 7000, start_month: "2025-11", notes: "Trellising + pruning program" },
    polygon: [
      { lat: -1.1696, lon: 36.8289 },
      { lat: -1.1695, lon: 36.8310 },
      { lat: -1.1708, lon: 36.8312 },
      { lat: -1.1710, lon: 36.8291 },
    ],
    timeseries: mkSeries(0.55),
  },
  {
    id: "KERIO",
    name: "Kerio Valley Co‑op",
    produce: "Chili",
    variety: "Cayenne",
    region: "Elgeyo‑Marakwet",
    country: "KE",
    lat: 1.0,
    lon: 35.6,
    stage: "Field Planning",
    labels: ["Rain‑watered"],
    mechanization: "Mechanized",
    families_impacted: 22,
    production_tpw: 1.4,
    ndvi: 0.64,
    ndvi_trend: "up",
    has_satellite: false,
    contractor_available: false,
    contract_status: "None",
    investment: { funding_needed_usd: 25000, capex_usd: 20000, opex_usd: 5000, start_month: "2026-01", notes: "Nursery + mechanized planter" },
    polygon: [
      { lat: 1.001, lon: 35.598 },
      { lat: 1.002, lon: 35.602 },
      { lat: 0.999, lon: 35.603 },
      { lat: 0.998, lon: 35.599 },
    ],
    timeseries: mkSeries(0.60),
  },
];

const PRODUCE = ["French Beans", "Chili", "Passion Fruit", "Macadamia"] as const;

type Produce = typeof PRODUCE[number];

// Kenya bbox (approx)
const BOUNDS = { latMin: -4.7, latMax: 5.2, lonMin: 33.9, lonMax: 41.9 } as const;
function project(lat: number, lon: number) {
  const x = (lon - BOUNDS.lonMin) / (BOUNDS.lonMax - BOUNDS.lonMin);
  const y = (BOUNDS.latMax - lat) / (BOUNDS.latMax - BOUNDS.latMin);
  return { x, y };
}

export default function FundConsole() {
  const [produce, setProduce] = useState<Produce | "All">("All");
  const [indexType, setIndexType] = useState<IndexType>("NDVI");
  const [cloudMax, setCloudMax] = useState<number>(60); // %
  const [showSat, setShowSat] = useState(true);
  const [zoom, setZoom] = useState(1.2);
  const [center, setCenter] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.55 });
  const [activeId, setActiveId] = useState<string | null>(FARMS[0]?.id || null);
  const [tIndex, setTIndex] = useState<number>(0); // timeline index

  const farms = useMemo(() => FARMS.filter(f => (produce === "All" ? true : f.produce === produce)), [produce]);
  const active = farms.find(f => f.id === activeId) || farms[0] || null;

  // derive timeline from active + filter clouds
  const timeline = useMemo(() => {
    if (!active) return [] as TimePoint[];
    const raw = active.timeseries[indexType] || [];
    return raw.filter(tp => (tp.clouds ?? 0) <= cloudMax);
  }, [activeId, indexType, cloudMax]);

  useEffect(() => {
    if (!active) return;
    const { x, y } = project(active.lat, active.lon);
    setCenter({ x, y });
    setZoom(1.8);
    setTIndex(0);
  }, [activeId]);

  const totals = useMemo(() => {
    const tpw = farms.reduce((a, f) => a + f.production_tpw, 0);
    const need = farms.reduce((a, f) => a + (f.investment.funding_needed_usd || 0), 0);
    const contracts = farms.filter(f => f.contract_status === "Signed").length;
    const avgNdvi = farms.length ? farms.reduce((a, f) => a + f.ndvi, 0) / farms.length : 0;
    return { tpw, need, contracts, avgNdvi };
  }, [farms]);

  const currentTp = timeline[tIndex] || timeline[0];

  return (
    <div className="min-h-screen w-full bg-[#0B0F10] text-white">
      <Header />

      {/* Top dashboard controls */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">F&F Fund — Production & Investment</h1>
            <p className="text-white/70">Select a crop, explore farms, scrub satellite dates, and view plant health & finance.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={produce} onValueChange={(v: any) => setProduce(v)}>
              <SelectTrigger className="w-40 bg-white/10 border-white/15 text-white"><SelectValue placeholder="All produce" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All produce</SelectItem>
                {PRODUCE.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={indexType} onValueChange={(v: any) => setIndexType(v)}>
              <SelectTrigger className="w-36 bg-white/10 border-white/15 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["NDVI","NDMI","EVI","RGB"].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="secondary" className={`rounded-xl border ${showSat ? "bg-emerald-400/20 border-emerald-300" : "bg-white/10 border-white/15"}`} onClick={() => setShowSat(v => !v)}>
              <Satellite className="h-4 w-4 mr-2"/> Satellite
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Tons/week (selected)" value={`${totals.tpw.toFixed(1)} t`} icon={<Leaf className="h-4 w-4"/>} />
          <MetricCard label="Funding needed" value={`$${formatMoney(totals.need)}`} icon={<DollarSign className="h-4 w-4"/>} />
          <MetricCard label="Contracts signed" value={`${totals.contracts}`} icon={<CheckCircle2 className="h-4 w-4"/>} />
          <MetricCard label="Avg NDVI" value={totals.avgNdvi.toFixed(2)} icon={<TrendingUp className="h-4 w-4"/>} />
        </div>

        {/* Grid: list + details */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="bg-white/5 border-white/10 rounded-2xl lg:col-span-2">
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {farms.map(f => (
                  <button key={f.id} onClick={() => setActiveId(f.id)} className={`text-left rounded-xl ring-1 transition p-4 ${active?.id === f.id ? "ring-emerald-300 bg-emerald-400/10" : "ring-white/10 bg-white/5 hover:bg-white/10"}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{f.name}</div>
                      <StageBadge stage={f.stage}/>
                    </div>
                    <div className="mt-1 text-xs text-white/60">{f.region}</div>
                    <div className="mt-2 text-sm text-white/80">Variety <span className="font-medium">{f.variety}</span> • {f.production_tpw} t/wk</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {f.labels.map(lb => <Badge key={lb} className="bg-white/10 border border-white/15">{lb}</Badge>)}
                      <Badge className="bg-white/10 border border-white/15">{f.mechanization}</Badge>
                      {f.contractor_available && <Badge className="bg-emerald-400/20 border border-emerald-300 text-emerald-200">Contractor available</Badge>}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 rounded-2xl">
            <CardContent className="p-5">
              {active ? (
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/60">{active.region}</div>
                      <div className="text-lg font-semibold">{active.name}</div>
                    </div>
                    <StageBadge stage={active.stage}/>
                  </div>
                  <div className="mt-2 text-sm">{active.produce} • Variety {active.variety} • {active.production_tpw} t/wk</div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Index" value={indexType} />
                    <InfoRow label="NDVI (latest)" value={active.ndvi.toFixed(2)} ok={active.ndvi >= 0.6} />
                    <InfoRow label="Trend" value={active.ndvi_trend} />
                    <InfoRow label="Families" value={`${active.families_impacted}+`} />
                    <InfoRow label="Mechanization" value={active.mechanization} />
                    <InfoRow label="Contract" value={active.contract_status || "None"} ok={active.contract_status === "Signed"} />
                  </div>

                  <div className="mt-4 rounded-xl bg-emerald-400/10 p-3 ring-1 ring-emerald-300/60">
                    <div className="text-xs text-emerald-200">Investment</div>
                    <div className="text-sm mt-1">Funding needed: <span className="font-semibold">${formatMoney(active.investment.funding_needed_usd)}</span> • Start {active.investment.start_month}</div>
                    {(active.investment.capex_usd || active.investment.opex_usd) && (
                      <div className="text-xs text-white/70 mt-1">CAPEX ${formatMoney(active.investment.capex_usd || 0)} • OPEX ${formatMoney(active.investment.opex_usd || 0)}</div>
                    )}
                    {active.investment.notes && <div className="text-xs text-white/70 mt-1">{active.investment.notes}</div>}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-white/70">No selection.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Map + Controls */}
      <section className="mt-2 border-t border-white/10 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-sm text-white/80"><Map className="h-4 w-4"/> <span>Interactive map</span></div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-white/70"><Cloud className="h-4 w-4"/> Cloud ≤ {cloudMax}%</div>
              <input type="range" min={0} max={100} value={cloudMax} onChange={(e)=>setCloudMax(Number(e.target.value))} className="w-40"/>
              <Button variant="secondary" className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15" onClick={() => setZoom(z => Math.min(3, z + 0.2))}><ZoomIn className="h-4 w-4"/></Button>
              <Button variant="secondary" className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15" onClick={() => setZoom(z => Math.max(1, z - 0.2))}><ZoomOut className="h-4 w-4"/></Button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-9 rounded-2xl overflow-hidden ring-1 ring-white/15">
              <MapPanel farms={farms} active={active} setActiveId={setActiveId} center={center} zoom={zoom} indexType={indexType} showSat={showSat} currentTp={currentTp} />

              {/* Timeline bar */}
              <div className="bg-black/60 px-4 py-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <div className="inline-flex items-center gap-2"><CalendarClock className="h-4 w-4"/> Timeline</div>
                  <div>
                    {timeline.length ? (timeline[tIndex]?.date) : "No imagery"}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="secondary" className="rounded-md bg-white/10 hover:bg-white/20 border border-white/15" onClick={()=>setTIndex(i=>Math.max(0,i-1))}><ChevronLeft className="h-4 w-4"/></Button>
                  <input type="range" min={0} max={Math.max(0, timeline.length-1)} value={Math.min(tIndex, Math.max(0, timeline.length-1))} onChange={(e)=>setTIndex(Number(e.target.value))} className="flex-1"/>
                  <Button variant="secondary" className="rounded-md bg-white/10 hover:bg-white/20 border border-white/15" onClick={()=>setTIndex(i=>Math.min((timeline.length-1)||0,i+1))}><ChevronRight className="h-4 w-4"/></Button>
                </div>
                <div className="mt-2 text-[10px] text-white/60">Images with cloudiness over {cloudMax}% are hidden.</div>
              </div>
            </div>

            {/* Right tabs */}
            <div className="lg:col-span-3 space-y-3">
              <RightTabs active={active} indexType={indexType} />
            </div>
          </div>
        </div>
      </section>

      {/* Inline tests */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <DevTests farms={FARMS} />
      </section>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(16,185,129,0.08),transparent)]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
          <span className="font-semibold tracking-wide">GreenStem — F&F Fund</span>
        </div>
        <div className="text-xs text-white/60">Prototype • EOS-style timeline • Kenya focus</div>
      </div>
    </header>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <Card className="bg-white/5 border-white/10 rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-white/70">{icon}<span>{label}</span></div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function StageBadge({ stage }: { stage: Stage }) {
  const cls: Record<Stage, string> = {
    "Field Planning": "bg-emerald-400/20 border-emerald-300 text-emerald-200",
    "Harvesting": "bg-lime-400/20 border-lime-300 text-lime-100",
    "Packhouse": "bg-amber-400/20 border-amber-300 text-amber-100",
    "Cold-chain": "bg-sky-400/20 border-sky-300 text-sky-100",
    "In Transit": "bg-indigo-400/20 border-indigo-300 text-indigo-100",
    "Arrival": "bg-emerald-500/30 border-emerald-400 text-white",
  };
  return <span className={`text-[10px] px-2 py-1 rounded-full border ${cls[stage]}`}>{stage}</span>;
}

function InfoRow({ label, value, ok }: { label: string; value: string | number; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 p-2 ring-1 ring-white/10">
      <span className="text-xs text-white/60">{label}</span>
      <span className={`text-sm font-medium ${ok === undefined ? "text-white" : ok ? "text-emerald-200" : "text-amber-200"}`}>{value}</span>
    </div>
  );
}

function RegionPresets({ onCenter, onZoom }: { onCenter: (c: {x:number;y:number}) => void; onZoom: (z:number) => void }) {
  const presets = [
    { label: "Kenya", lat: 0.34, lon: 37.0, z: 1.2 },
    { label: "Eldoret", lat: 0.514, lon: 35.27, z: 2.0 },
    { label: "Kiambu", lat: -1.17, lon: 36.83, z: 2.0 },
  ];
  return (
    <div className="inline-flex items-center gap-2">
      {presets.map(p => (
        <Button key={p.label} variant="secondary" className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15" onClick={() => { const { x, y } = project(p.lat, p.lon); onCenter({ x, y }); onZoom(p.z); }}>
          {p.label}
        </Button>
      ))}
    </div>
  );
}

function MapPanel({ farms, active, setActiveId, center, zoom, indexType, showSat, currentTp }: {
  farms: FarmSite[];
  active: FarmSite | null;
  setActiveId: (id: string) => void;
  center: { x: number; y: number };
  zoom: number;
  indexType: IndexType;
  showSat: boolean;
  currentTp?: TimePoint;
}) {
  // background layers simulated
  return (
    <div className="relative w-full h-[540px] bg-black">
      {/* pseudo satellite raster */}
      <div className={`absolute inset-0 ${showSat ? "opacity-100" : "opacity-40"}`} style={{ backgroundImage: "radial-gradient(ellipse at 30% 20%, rgba(120,180,120,0.25), transparent 40%), radial-gradient(ellipse at 70% 60%, rgba(60,120,60,0.25), transparent 35%), linear-gradient(0deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03))" }} />

      {/* Kenya frame (rough) */}
      <svg className="absolute inset-0" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <rect x="0" y="0" width="1000" height="1000" fill="transparent" stroke="rgba(255,255,255,0.06)" />
        <polygon points="300,100 700,220 820,480 620,860 380,860 250,480" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
      </svg>

      {/* pan/zoom container */}
      <div className="absolute inset-0" style={{ transform: `scale(${zoom}) translate(${(0.5 - center.x) * 100}%, ${(0.5 - center.y) * 100}%)`, transformOrigin: "center" }}>
        {/* Field polygons */}
        <svg className="absolute inset-0" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          {farms.map(f => {
            const pts = f.polygon.map(p => {
              const { x, y } = project(p.lat, p.lon); return `${x * 1000},${y * 1000}`;
            }).join(" ");
            const sel = active?.id === f.id;
            const c = indexColor(indexType, (currentTp?.value ?? f.ndvi));
            return (
              <g key={f.id}>
                <polygon points={pts} fill={c} opacity={sel ? 0.35 : 0.2} stroke={sel ? "#86efac" : "rgba(255,255,255,0.3)"} strokeWidth={sel ? 3 : 1.5} />
              </g>
            );
          })}
        </svg>

        {/* farm labels / pins */}
        {farms.map(f => {
          const { x, y } = project(f.lat, f.lon);
          const left = `${x * 100}%`;
          const top = `${y * 100}%`;
          const activeSel = active?.id === f.id;
          return (
            <button key={f.id} onClick={() => setActiveId(f.id)} style={{ left, top }} className="absolute -translate-x-1/2 -translate-y-1/2">
              <div className={`px-2 py-1 rounded-lg border text-xs shadow ${activeSel ? "bg-emerald-500/90 border-emerald-300 text-black" : "bg-white/90 text-black border-black/10"}`}>{f.id}</div>
            </button>
          );
        })}
      </div>

      {/* legend */}
      <div className="absolute bottom-3 left-3 text-xs text-white/80 bg-black/50 rounded-md px-3 py-2 border border-white/10">
        <div className="font-medium">Legend</div>
        <div className="mt-1">Polygon color = {indexType}</div>
      </div>
    </div>
  );
}

function RightTabs({ active, indexType }: { active: FarmSite | null; indexType: IndexType }) {
  if (!active) return null;
  const ts = active.timeseries[indexType] || [];
  return (
    <Card className="bg-white/5 border-white/10 rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 text-sm">
          <Button disabled variant="secondary" className="rounded-lg bg-white/10 border-white/15"><ClipboardList className="h-4 w-4 mr-1"/> Crop info</Button>
          <Button disabled variant="secondary" className="rounded-lg bg-white/10 border-white/15"><LineChart className="h-4 w-4 mr-1"/> Chart</Button>
          <Button disabled variant="secondary" className="rounded-lg bg-white/10 border-white/15"><Info className="h-4 w-4 mr-1"/> Activities</Button>
        </div>

        {/* Crop info */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <InfoRow label="Produce" value={`${active.produce} • ${active.variety}`} />
          <InfoRow label="Region" value={active.region} />
          <InfoRow label="Mechanization" value={active.mechanization} />
          <InfoRow label="Labels" value={active.labels.join(", ")} />
        </div>

        {/* NDVI tiny chart */}
        <div className="mt-5">
          <div className="text-xs text-white/70 mb-1">{indexType} timeseries</div>
          <MiniSpark points={ts} />
        </div>

        {/* Activities stub */}
        <div className="mt-5 text-xs text-white/70">
          <div>• Contractor status: {active.contract_status || "None"}</div>
          <div>• Next milestone: Planting window • {active.investment.start_month}</div>
          <div>• Notes: {active.investment.notes || "—"}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniSpark({ points }: { points: TimePoint[] }) {
  if (!points.length) return <div className="text-xs text-white/50">No data</div>;
  const w = 240, h = 60, p = 6;
  const xs = points.map((_, i) => p + (i * (w - 2*p)) / Math.max(1, points.length - 1));
  const ys = points.map(pt => h - (pt.value * (h - 2*p)) - p);
  const d = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
  return (
    <svg width={w} height={h} className="rounded-md bg-white/5 ring-1 ring-white/10">
      <polyline fill="none" stroke="#86efac" strokeWidth={2} points={d} />
    </svg>
  );
}

function indexColor(ix: IndexType, v: number) {
  // NDVI/NDMI/EVI -> hue ramp; RGB -> neutral
  if (ix === "RGB") return "rgba(255,255,255,0.15)";
  const clamp = Math.max(0, Math.min(1, v));
  // map 0..1 -> red (0) to green (120deg)
  const hue = 120 * clamp; // 0=red,120=green
  return `hsla(${hue}, 70%, 45%, 1)`;
}

function mkSeries(seed=0.55): Record<IndexType, TimePoint[]> {
  const days = [0, 15, 30, 45, 60, 75, 90];
  const mk = (base: number) => days.map((d,i) => ({ date: addDays(new Date(2025,0,5), d).toISOString().slice(0,10), value: clamp01(base + (Math.sin(i/2)+Math.random()*0.1-0.05)*0.06), clouds: Math.floor(Math.random()*80) }));
  return { NDVI: mk(seed), NDMI: mk(seed-0.1), EVI: mk(seed-0.05), RGB: mk(seed) } as const;
}

function addDays(d: Date, n: number) { const dd = new Date(d); dd.setDate(dd.getDate()+n); return dd; }
function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

function formatMoney(n: number) { return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }

// ===================== Dev Tests ===================== //
function DevTests({ farms }: { farms: FarmSite[] }) {
  const tests: { name: string; pass: boolean }[] = [];
  tests.push({ name: "Farms exist", pass: farms.length > 0 });
  // Lat/Lon bounds
  const inBounds = farms.every(f => f.lat >= BOUNDS.latMin && f.lat <= BOUNDS.latMax && f.lon >= BOUNDS.lonMin && f.lon <= BOUNDS.lonMax);
  tests.push({ name: "Lat/Lon within KE bounds", pass: inBounds });
  // Polygon has at least 3 points
  tests.push({ name: "Polygons valid", pass: farms.every(f => (f.polygon?.length || 0) >= 3) });
  // Funding >= 0
  tests.push({ name: "Funding >= 0", pass: farms.every(f => f.investment.funding_needed_usd >= 0) });
  // NDVI in [0,1]
  tests.push({ name: "NDVI in [0,1]", pass: farms.every(f => f.ndvi >= 0 && f.ndvi <= 1) });

  return (
    <div>
      <div className="inline-flex items-center gap-2 text-sm text-white/70"><Info className="h-4 w-4"/> Data Integrity</div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {tests.map((t, i) => (
          <Card key={i} className={`rounded-xl ${t.pass ? "border-emerald-300 bg-emerald-400/10" : "border-amber-300 bg-amber-400/10"}`}>
            <CardContent className="p-3 text-sm">
              <div className="font-medium">{t.name}</div>
              <div className={`text-xs mt-1 ${t.pass ? "text-emerald-300" : "text-amber-300"}`}>{t.pass ? "PASS" : "FAIL"}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}




