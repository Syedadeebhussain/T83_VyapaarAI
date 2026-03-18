
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login(){

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const login = async () => {

    const res = await fetch("/api/auth/login",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        email,
        password
      })
    });

    const data = await res.json();

    localStorage.setItem("token",data.token);

    window.location.href="/dashboard";
  };

  return (

    <div className="space-y-4">

      <Input
        placeholder="Email"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <Input
        type="password"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <Button onClick={login}>
        Login
      </Button>

    </div>

  );
}
