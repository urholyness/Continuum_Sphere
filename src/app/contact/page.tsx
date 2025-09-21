"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import NavBar from "@/components/NavBar";

export default function ContactPage(){
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [msg,setMsg] = useState("");
  return (
    <div className="min-h-screen w-full bg-[#0B0F10] text-white">
      <NavBar />
      <section className="max-w-3xl mx-auto px-6 md:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-semibold">Contact</h1>
        <p className="mt-2 text-white/70">Email <a className="underline" href="mailto:friends@greenstemglobal.com">friends@greenstemglobal.com</a> or use the form below.</p>
        <Card className="bg-white/5 border-white/10 p-6 mt-6 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
            <Input type="email" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <Textarea className="mt-3" rows={6} placeholder="How can we help?" value={msg} onChange={e=>setMsg(e.target.value)} />
          <div className="mt-4 flex gap-2">
            <Button asChild className="rounded-xl"><a href={`mailto:friends@greenstemglobal.com?subject=Buyer%20inquiry%20from%20${encodeURIComponent(name)}&body=${encodeURIComponent(msg + "\n\nFrom: " + name + " (" + email + ")")}`}>Send via email</a></Button>
          </div>
        </Card>
      </section>
    </div>
  );
}