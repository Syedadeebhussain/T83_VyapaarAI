"use client";

import { useState } from "react";
import { registerUser } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    const res = await registerUser({ name, email, password });

    if (res.message) {
      alert("Registered successfully");
      router.push("/login");
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-6 border rounded w-80">
        <h2 className="text-xl mb-4">Register</h2>

        <input
          className="w-full p-2 border mb-3"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

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
          className="w-full bg-green-500 text-white p-2"
          onClick={handleRegister}
        >
          Register
        </button>
      </div>
    </div>
  );
}
