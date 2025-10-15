'use client';

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Create a separate component that uses useSearchParams
const AdminLoginContent: React.FC = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error")) {
      setError("Invalid credentials");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem("username") as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const res = await signIn("credentials", {
      username,
      password,
      redirect: true,
      callbackUrl: "/admin/dashboard/DC",
    });
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-hpblue via-coolgray to-black dark:from-black dark:via-hpblue dark:to-coolgray transition-colors duration-500">
      {/* Left Section with Image */}
      <div className="relative w-1/2 h-screen">
        <Image
          src="/images/hpLaptops.png"
          alt="HP laptops promotional image"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="w-1/2 h-full flex flex-col items-center justify-center bg-white/80 dark:bg-white/10 backdrop-blur-lg border-l border-white/30 p-10">
        <h2 className="text-4xl font-poppins font-bold text-hpblue mb-6">
          Admin Login
        </h2>
        <form className="w-full max-w-sm space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              id="username"
              name="username"
              required
              className="peer w-full px-4 py-3 bg-transparent border-b-2 border-hpblue text-black dark:text-white focus:outline-none focus:border-blue-400 transition-colors"
            />
            <label
              htmlFor="username"
              className="absolute left-4 top-3 text-gray-500 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-hpblue transition-all bg-white/80 dark:bg-black px-1 pointer-events-none"
            >
              Username
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              required
              className="peer w-full px-4 py-3 bg-transparent border-b-2 border-hpblue text-black dark:text-white focus:outline-none focus:border-blue-400 transition-colors"
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-3 text-gray-500 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-hpblue transition-all bg-white/80 dark:bg-black px-1 pointer-events-none"
            >
              Password
            </label>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            name="login"
            className="w-full py-3 mt-4 rounded-full bg-blue-700 text-white font-semibold text-lg shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-black hover:to-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Main component that wraps the content with Suspense
const AdminLogin: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
};

export default AdminLogin;