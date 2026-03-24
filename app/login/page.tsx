"use client";

import { useState } from "react";
import { loginUser } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await loginUser({ email, password });

    if (res.token) {
      localStorage.setItem("token", res.token);
      router.push("/dashboard");
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-6 border rounded w-80">
        <h2 className="text-xl mb-4">Login</h2>

        <input
          className="w-full p-2 border mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 border mb-3"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-blue-500 text-white p-2"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}
