"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl">Dashboard</h1>
      <p>Welcome! You are logged in 🎉</p>
    </div>
  );
}
