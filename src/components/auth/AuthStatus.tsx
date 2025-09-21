"use client";
import React, { useEffect, useState } from "react";

export default function AuthStatus(){
  const [role, setRole] = useState<string>("");
  useEffect(()=>{
    // lightweight role probe: read from meta injected by server later; for now, hide.
    (async ()=>{ setRole(""); })();
  },[]);
  if(!role) return null;
  return <div className="text-[11px] text-emerald-200 bg-emerald-400/10 border border-emerald-300/30 rounded-md px-2 py-1">Signed in: {role}</div>;
}






