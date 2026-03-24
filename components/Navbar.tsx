"use client";

export default function Navbar() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex justify-between p-4 bg-gray-800 text-white">
      <h1>VyaparAI</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
