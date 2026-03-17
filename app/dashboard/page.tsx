
"use client";

import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";

export default function Dashboard(){

  const { user } = useAuth();

  if(!user){
    redirect("/login");
  }

  return <div>Dashboard</div>;
}
