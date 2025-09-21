"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/buyers";
  const router = useRouter();

  const [role, setRole] = useState<"BUYER"|"INVESTOR"|"ADMIN">("BUYER");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault(); 
    setLoading(true); 
    setError("");
    try{
      const res = await fetch("/api/login", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ role, code, next, username, password }) 
      });
      if(!res.ok){ 
        const j = await res.json().catch(()=>({message:"Login failed"})); 
        throw new Error(j.message || "Login failed"); 
      }
      const j = await res.json();
      router.push(j.next || next);
    }catch(err:any){ 
      setError(err.message); 
    }
    finally{ 
      setLoading(false); 
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F10] text-white grid place-items-center px-6 py-12">
      <Card className="bg-white/5 border-white/10 rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-white/70 text-sm mt-1">Buyers & Investors — enter your invite code to continue.</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <Button 
              type="button" 
              variant={role==="BUYER"?"default":"secondary"} 
              className="rounded-xl" 
              onClick={()=>setRole("BUYER")}
            >
              Buyer
            </Button>
            <Button 
              type="button" 
              variant={role==="INVESTOR"?"default":"secondary"} 
              className="rounded-xl" 
              onClick={()=>setRole("INVESTOR")}
            >
              Investor (F&F)
            </Button>
            <Button 
              type="button" 
              variant={role==="ADMIN"?"default":"secondary"} 
              className="rounded-xl" 
              onClick={()=>setRole("ADMIN")}
            >
              Admin
            </Button>
          </div>
          {role === "ADMIN" ? (
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={e=>setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="code">Invite code</Label>
              <Input 
                id="code" 
                placeholder="enter invite code or use username/password" 
                value={code} 
                onChange={e=>setCode(e.target.value)} 
              />
              <div className="grid grid-cols-2 gap-3 text-xs text-white/60">
                <Input placeholder="username (optional)" value={username} onChange={e=>setUsername(e.target.value)} />
                <Input type="password" placeholder="password (optional)" value={password} onChange={e=>setPassword(e.target.value)} />
              </div>
            </div>
          )}
          {error && <div className="text-rose-300 text-sm">{error}</div>}
          <Button 
            type="submit" 
            className="w-full rounded-xl" 
            disabled={loading}
          >
            {loading?"Signing in…":"Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage(){
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F10] text-white grid place-items-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
