import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, Save, MapPin, Leaf, Rocket, Satellite, Settings, Database, Factory, Ruler, Activity, Soup, Thermometer, Droplets, Mountain, Pencil, CheckCircle2, AlertTriangle, Eraser } from "lucide-react";

// ==========================================================
// GreenStemGlobal — Admin Dashboard (LCARS-lite)
// One-file TSX component for owner/admin data entry. No external APIs.
// - Add & edit farms (geo, acreage, irrigation, mechanization, certs)
// - Define crop plans and sensors
// - Import/Export JSON, localStorage persistence
// - Inline tests & derived metrics
// ==========================================================

// ---------- Types ----------
export type Mechanization = "Mechanized" | "Hand-harvest" | "Hybrid";
export type Irrigation = "Drip" | "Sprinkler" | "Furrow" | "Rain-fed" | "Mixed";
export type Certification = "GlobalG.A.P" | "EU Organic" | "KEPHIS" | "Fairtrade" | "None";

export interface Sensor {
  id: string;
  type: "SoilMoisture" | "Temp" | "Humidity" | "NDVI" | "pH" | "EC";
  units: string; // e.g., "%", "°C"
  notes?: string;
}

export interface CropPlan {
  crop: string; // e.g., French Beans
  variety?: string; // e.g., Star 2008
  startDate: string; // ISO date
  harvestFrom: string; // ISO date
  harvestTo?: string; // ISO date
  expectedYieldTPerHa?: number; // tons/ha (optional)
}

export interface Farm {
  id: string; // short code
  name: string;
  region: string; // county/state
  country: string; // KE, DE, US, etc.
  latitude: number;
  longitude: number;
  altitudeM?: number;
  acreageHa: number;
  soilType?: string;
  irrigation: Irrigation;
  mechanization: Mechanization;
  waterSource?: string; // borehole, river, rainwater, etc.
  certifications: Certification[];
  contact?: string; // person/phone/email (free text)
  notes?: string;
  sensors: Sensor[];
  cropPlan: CropPlan[];
}

// ---------- Real farm data from DynamoDB ----------
const REAL_FARMS: Farm[] = [
  {
    id: "2BH",
    name: "2 Butterflies Homestead",
    region: "Uasin Gishu",
    country: "KE",
    latitude: 0.5143,      // Real coordinates from DynamoDB
    longitude: 35.2698,    // Real coordinates from DynamoDB
    altitudeM: 2100,       // Real elevation
    acreageHa: 3.64,       // Real acreage (9 acres = 3.64 hectares)
    soilType: "Loam",
    irrigation: "Drip",
    mechanization: "Hybrid",
    waterSource: "Rain + Borehole",
    certifications: ["GlobalG.A.P", "KEPHIS"],
    contact: "Vio — +2547•••",
    notes: "Real farm - French Beans production",
    sensors: [
      { id: "2BH-SM1", type: "SoilMoisture", units: "%", notes: "10cm depth" },
      { id: "2BH-T1", type: "Temp", units: "°C" },
      { id: "2BH-NDVI", type: "NDVI", units: "idx", notes: "Live satellite data" },
    ],
    cropPlan: [
      { crop: "French Beans", variety: "Bean STAR 2054", startDate: "2025-08-20", harvestFrom: "2025-10-05", harvestTo: "2025-12-20", expectedYieldTPerHa: 6.5 },
      { crop: "Chili", variety: "Cayenne", startDate: "2025-07-01", harvestFrom: "2025-10-01" },
    ],
  },
  {
    id: "NOAH",
    name: "Noah's Joy",
    region: "Kiambu",
    country: "KE",
    latitude: -1.17,       // Real coordinates
    longitude: 36.83,      // Real coordinates
    altitudeM: 1700,       // Real elevation
    acreageHa: 0.50,       // Real acreage
    soilType: "Clay loam",
    irrigation: "Rain-fed",
    mechanization: "Hand-harvest",
    waterSource: "Rain",
    certifications: ["GlobalG.A.P"],
    contact: "Hill — +2547•••",
    sensors: [ 
      { id: "NJ-NDVI", type: "NDVI", units: "idx", notes: "Live satellite data" },
      { id: "NJ-SM1", type: "SoilMoisture", units: "%", notes: "15cm depth" },
    ],
    cropPlan: [ 
      { crop: "Passion Fruit", variety: "Purple", startDate: "2025-06-15", harvestFrom: "2025-09-20", expectedYieldTPerHa: 8.2 } 
    ],
  },
];

// Use real farms as default, fallback to empty array for new farms
const SEED_FARMS = REAL_FARMS;

// ---------- Helpers ----------
function uuid(prefix = "ID") { return `${prefix}-${Math.random().toString(36).slice(2, 8)}`; }

function isLat(v: number) { return v >= -90 && v <= 90; }
function isLon(v: number) { return v >= -180 && v <= 180; }

// ---------- Main component ----------
export default function AdminDashboardLCARS() {
  const [farms, setFarms] = useState<Farm[]>(() => {
    try { const raw = localStorage.getItem("gsg.admin.farms"); if (raw) return JSON.parse(raw); } catch {}
    return SEED_FARMS;
  });
  const [selected, setSelected] = useState<number>(0);
  const sel = farms[selected];

  useEffect(() => { localStorage.setItem("gsg.admin.farms", JSON.stringify(farms)); }, [farms]);

  // Derived metrics
  const totals = useMemo(() => {
    const acreage = farms.reduce((a, f) => a + (f.acreageHa || 0), 0);
    const sensors = farms.reduce((a, f) => a + f.sensors.length, 0);
    const crops = new Set<string>(); farms.forEach(f => f.cropPlan.forEach(c => crops.add(`${c.crop}|${c.variety || "-"}`)));
    return { acreage, sensors, crops: crops.size, farms: farms.length };
  }, [farms]);

  // Form state for current farm
  const [form, setForm] = useState<Farm>(() => sel || emptyFarm());
  useEffect(() => { setForm(sel || emptyFarm()); }, [selected]);

  function emptyFarm(): Farm {
    return {
      id: "",
      name: "",
      region: "",
      country: "KE",
      latitude: 0,
      longitude: 0,
      altitudeM: undefined,
      acreageHa: 0,
      soilType: "",
      irrigation: "Drip",
      mechanization: "Mechanized",
      waterSource: "",
      certifications: [],
      contact: "",
      notes: "",
      sensors: [],
      cropPlan: [],
    };
  }

  function update<K extends keyof Farm>(key: K, value: Farm[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function saveFarm() {
    // validations
    const errs: string[] = [];
    if (!form.name.trim()) errs.push("Name required");
    if (!form.id.trim()) errs.push("Code required");
    if (!isLat(form.latitude)) errs.push("Latitude must be -90..90");
    if (!isLon(form.longitude)) errs.push("Longitude must be -180..180");
    if (form.acreageHa <= 0) errs.push("Acreage must be > 0");
    const duplicateId = farms.some((f, i) => f.id === form.id && i !== selected);
    if (duplicateId) errs.push("Code must be unique");

    if (errs.length) { alert("Fix errors:\n" + errs.join("\n")); return; }

    setFarms(prev => {
      const copy = [...prev];
      if (selected >= 0 && selected < copy.length) copy[selected] = form; else copy.push(form);
      return copy;
    });
  }

  function newFarm() { setFarms(prev => [...prev, emptyFarm()]); setSelected(farms.length); }
  function deleteFarm() {
    if (!confirm("Delete this farm?")) return;
    setFarms(prev => prev.filter((_, i) => i !== selected));
    setSelected(0);
  }

  function addSensor() {
    setForm(f => ({ ...f, sensors: [...f.sensors, { id: uuid("SNS"), type: "SoilMoisture", units: "%" }] }));
  }
  function updateSensor(i: number, patch: Partial<Sensor>) {
    setForm(f => ({ ...f, sensors: f.sensors.map((s, idx) => idx === i ? { ...s, ...patch } : s) }));
  }
  function removeSensor(i: number) {
    setForm(f => ({ ...f, sensors: f.sensors.filter((_, idx) => idx !== i) }));
  }

  function addCrop() {
    setForm(f => ({ ...f, cropPlan: [...f.cropPlan, { crop: "French Beans", variety: "Star 2008", startDate: today(), harvestFrom: today(45) }] }));
  }
  function updateCrop(i: number, patch: Partial<CropPlan>) {
    setForm(f => ({ ...f, cropPlan: f.cropPlan.map((c, idx) => idx === i ? { ...c, ...patch } : c) }));
  }
  function removeCrop(i: number) { setForm(f => ({ ...f, cropPlan: f.cropPlan.filter((_, idx) => idx !== i) })); }

  function toggleCert(form: Farm, setForm: React.Dispatch<React.SetStateAction<Farm>>, cert: Certification) {
    const isSelected = form.certifications.includes(cert);
    setForm(f => ({
      ...f,
      certifications: isSelected
        ? f.certifications.filter(c => c !== cert)
        : [...f.certifications, cert]
    }));
  }

  function downloadJSON() {
    const data = JSON.stringify({ farms }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `gsg-admin-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || !Array.isArray(parsed.farms)) throw new Error("Invalid file");
        setFarms(parsed.farms);
        setSelected(0);
      } catch (e: any) { alert("Import failed: " + e.message); }
    };
    reader.readAsText(file);
  }

  // ---------- UI ----------
  return (
    <div className="w-full bg-[#0A1416]">
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-12 gap-6">
        {/* LCARS Side Rail */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
          <RailBlock label="Farms" icon={<Factory className="h-4 w-4" />} active />
          <RailBlock label="Data Streams" icon={<Satellite className="h-4 w-4" />} />
          <RailBlock label="Produce Catalog" icon={<Soup className="h-4 w-4" />} />
          <RailBlock label="Logistics" icon={<Rocket className="h-4 w-4" />} />
          <RailBlock label="Settings" icon={<Settings className="h-4 w-4" />} />
        </div>

        {/* Main Console */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <StatsBar totals={totals} />

          <Card className="bg-white/5 border-white/10 rounded-2xl">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-3">
                {/* Farm tabs */}
                <div className="flex flex-wrap gap-2">
                  {farms.map((f, i) => (
                    <button key={f.id || i}
                      onClick={() => setSelected(i)}
                      className={`px-3 py-1.5 rounded-full border text-sm ${i === selected ? "border-emerald-400 bg-emerald-400/10" : "border-white/10 hover:bg-white/5"}`}>
                      {f.id || `Farm ${i+1}`}
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-400" onClick={newFarm}>New Farm</Button>
                  <Button variant="secondary" className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15" onClick={saveFarm}><Save className="h-4 w-4 mr-1"/>Save</Button>
                  <Button variant="secondary" className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15" onClick={deleteFarm}><Eraser className="h-4 w-4 mr-1"/>Delete</Button>
                </div>
              </div>

              {/* Farm form */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Farm Name"><Input value={form.name} onChange={e=>update("name", e.target.value)} placeholder="Two Butterflies Homestead"/></Field>
                <Field label="Farm Code"><Input value={form.id} onChange={e=>update("id", e.target.value.toUpperCase())} placeholder="2BH"/></Field>
                <Field label="Region"><Input value={form.region} onChange={e=>update("region", e.target.value)} placeholder="Uasin Gishu"/></Field>
                <Field label="Country"><Input value={form.country} onChange={e=>update("country", e.target.value.toUpperCase())} placeholder="KE"/></Field>

                <Field label="Latitude"><Input type="number" value={form.latitude} onChange={e=>update("latitude", Number(e.target.value))}/></Field>
                <Field label="Longitude"><Input type="number" value={form.longitude} onChange={e=>update("longitude", Number(e.target.value))}/></Field>
                <Field label="Altitude (m)"><Input type="number" value={form.altitudeM ?? ""} onChange={e=>update("altitudeM", e.target.value === "" ? undefined : Number(e.target.value))}/></Field>
                <Field label="Acreage (ha)"><Input type="number" value={form.acreageHa} onChange={e=>update("acreageHa", Number(e.target.value))}/></Field>

                <Field label="Soil Type"><Input value={form.soilType || ""} onChange={e=>update("soilType", e.target.value)} placeholder="Loam"/></Field>
                <Field label="Water Source"><Input value={form.waterSource || ""} onChange={e=>update("waterSource", e.target.value)} placeholder="Borehole"/></Field>

                <Field label="Irrigation">
                  <Select value={form.irrigation} onValueChange={(v:Irrigation)=>update("irrigation", v)}>
                    <SelectTrigger className="bg-white/10 border-white/15"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {["Drip","Sprinkler","Furrow","Rain-fed","Mixed"].map(x=> <SelectItem key={x} value={x}>{x}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Mechanization">
                  <Select value={form.mechanization} onValueChange={(v:Mechanization)=>update("mechanization", v)}>
                    <SelectTrigger className="bg-white/10 border-white/15"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {["Mechanized","Hand-harvest","Hybrid"].map(x=> <SelectItem key={x} value={x}>{x}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Certifications">
                  <div className="flex flex-wrap gap-2">
                    {["GlobalG.A.P","EU Organic","KEPHIS","Fairtrade","None"].map(c => (
                      <Badge key={c} onClick={()=>toggleCert(form, setForm, c as Certification)} className={`cursor-pointer ${form.certifications.includes(c as Certification) ? "bg-emerald-400/20 border border-emerald-300 text-emerald-200" : "bg-white/10 border border-white/15 text-white/70"}`}>{c}</Badge>
                    ))}
                  </div>
                </Field>

                <Field label="Contact"><Input value={form.contact || ""} onChange={e=>update("contact", e.target.value)} placeholder="Name • phone/email"/></Field>
                <Field label="Notes" full><Textarea value={form.notes || ""} onChange={e=>update("notes", e.target.value)} placeholder="Operational notes..."/></Field>
              </div>

              {/* Sensors */}
              <SectionTitle icon={<Activity className="h-4 w-4"/>} title="Sensors" action={<Button variant="secondary" className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15" onClick={addSensor}>Add sensor</Button>} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {form.sensors.map((s, i) => (
                  <Card key={s.id} className="bg-black/30 border-white/10">
                    <CardContent className="p-4 grid grid-cols-2 gap-3 items-end">
                      <Field label="ID" full><Input value={s.id} onChange={e=>updateSensor(i,{id:e.target.value})}/></Field>
                      <Field label="Type">
                        <Select value={s.type} onValueChange={(v:any)=>updateSensor(i,{type:v})}>
                          <SelectTrigger className="bg-white/10 border-white/15"><SelectValue/></SelectTrigger>
                          <SelectContent>
                            {["SoilMoisture","Temp","Humidity","NDVI","pH","EC"].map(x=> <SelectItem key={x} value={x}>{x}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Units"><Input value={s.units} onChange={e=>updateSensor(i,{units:e.target.value})} placeholder="% / °C / idx"/></Field>
                      <Field label="Notes"><Input value={s.notes || ""} onChange={e=>updateSensor(i,{notes:e.target.value})}/></Field>
                      <div className="col-span-2 flex justify-end">
                        <Button variant="secondary" className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15" onClick={()=>removeSensor(i)}>Remove</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Crop plan */}
              <SectionTitle icon={<Leaf className="h-4 w-4"/>} title="Crop Plan" action={<Button variant="secondary" className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15" onClick={addCrop}>Add crop</Button>} />
              <div className="grid grid-cols-1 gap-4">
                {form.cropPlan.map((c, i) => (
                  <Card key={i} className="bg-black/30 border-white/10">
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                      <Field label="Crop"><Input value={c.crop} onChange={e=>updateCrop(i,{crop:e.target.value})} placeholder="French Beans"/></Field>
                      <Field label="Variety"><Input value={c.variety || ""} onChange={e=>updateCrop(i,{variety:e.target.value})} placeholder="Star 2008"/></Field>
                      <Field label="Start"><Input type="date" value={c.startDate} onChange={e=>updateCrop(i,{startDate:e.target.value})}/></Field>
                      <Field label="Harvest from"><Input type="date" value={c.harvestFrom} onChange={e=>updateCrop(i,{harvestFrom:e.target.value})}/></Field>
                      <Field label="Harvest to"><Input type="date" value={c.harvestTo || ""} onChange={e=>updateCrop(i,{harvestTo:e.target.value})}/></Field>
                      <Field label="Yield (t/ha)"><Input type="number" value={c.expectedYieldTPerHa ?? ""} onChange={e=>updateCrop(i,{expectedYieldTPerHa: e.target.value === "" ? undefined : Number(e.target.value)})}/></Field>
                      <div className="md:col-span-6 flex justify-end">
                        <Button variant="secondary" className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15" onClick={()=>removeCrop(i)}>Remove</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Import / Export */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button onClick={downloadJSON} className="rounded-xl bg-emerald-500 hover:bg-emerald-400"><Download className="h-4 w-4 mr-1"/>Export JSON</Button>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 cursor-pointer">
                  <Upload className="h-4 w-4"/> Import JSON
                  <input type="file" accept="application/json" className="hidden" onChange={importJSON}/>
                </label>
              </div>
            </CardContent>
          </Card>

          <InlineTests farms={farms} />
        </div>
      </div>
    </div>
  );
}

// ---------- Subcomponents ----------
function LCARSHeader() {
  return (
    <header className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(16,185,129,0.08),transparent)]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
          <span className="font-semibold tracking-wide">GreenStem — Admin Console</span>
        </div>
        <div className="text-xs text-white/60">LCARS‑lite • Stardate {new Date().toISOString().slice(0,10)}</div>
      </div>
    </header>
  );
}

function RailBlock({ label, icon, active=false }: { label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 border ${active ? "bg-[#DF8012]/10 border-[#DF8012]/30" : "bg-white/5 border-white/10"}`}>
      <div className="flex items-center gap-2 text-sm">
        {icon}<span className={active ? "text-[#DF8012]" : "text-white/80"}>{label}</span>
      </div>
    </div>
  );
}

function StatsBar({ totals }: { totals: { acreage: number; sensors: number; crops: number; farms: number } }) {
  const items = [
    { label: "Farms", value: totals.farms },
    { label: "Total acreage (ha)", value: totals.acreage.toFixed(2) },
    { label: "Sensors", value: totals.sensors },
    { label: "Crop lines", value: totals.crops },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((x, i) => (
        <Card key={i} className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-xs text-white/70">{x.label}</div>
            <div className="mt-1 text-2xl font-semibold">{x.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Field({ label, children, full=false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`${full ? "md:col-span-2" : ""}`}>
      <Label className="text-xs text-white/70">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function SectionTitle({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) {
  return (
    <div className="mt-8 mb-3 flex items-center justify-between">
      <div className="inline-flex items-center gap-2 text-sm text-white/80">{icon}<span className="font-medium">{title}</span></div>
      {action}
    </div>
  );
}

function InlineTests({ farms }: { farms: Farm[] }) {
  const tests: { name: string; pass: boolean; msg?: string }[] = [];
  // 1. Non-empty
  tests.push({ name: "At least 1 farm", pass: farms.length >= 1 });
  // 2. Geo ranges
  tests.push({ name: "All lat/lon valid", pass: farms.every(f => isLat(f.latitude) && isLon(f.longitude)) });
  // 3. Acreage > 0
  tests.push({ name: "All acreage > 0", pass: farms.every(f => f.acreageHa > 0) });
  // 4. Unique codes
  const codes = farms.map(f=>f.id); const uniq = new Set(codes);
  tests.push({ name: "Farm codes unique", pass: codes.length === uniq.size });
  // 5. Crop plan dates coherent (harvest >= start)
  const datesOk = farms.every(f => f.cropPlan.every(c => !c.harvestFrom || !c.startDate || new Date(c.harvestFrom) >= new Date(c.startDate)));
  tests.push({ name: "Crop plan dates coherent", pass: datesOk });

  return (
    <section>
      <div className="inline-flex items-center gap-2 text-sm text-white/70"><Database className="h-4 w-4"/> Data Integrity</div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {tests.map((t, i) => (
          <Card key={i} className={`rounded-xl ${t.pass ? "border-emerald-300 bg-emerald-400/10" : "border-amber-300 bg-amber-400/10"}`}>
            <CardContent className="p-3 text-sm">
              <div className="font-medium">{t.name}</div>
              <div className={`text-xs mt-1 ${t.pass ? "text-emerald-300" : "text-amber-300"}`}>{t.pass ? "PASS" : "FAIL"} {t.msg ? `• ${t.msg}` : ""}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ---------- misc ----------
function today(offsetDays = 0) {
  const d = new Date(); d.setDate(d.getDate() + offsetDays); return d.toISOString().slice(0,10);
}

