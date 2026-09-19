"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { hasSupabaseConfig, supabase } from "@/lib/supabase/client";

type Role = "customer" | "worker";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("customer");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!hasSupabaseConfig || !supabase) {
      setError(
        "Supabase is not configured. Please check your environment variables."
      );
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (mode === "signup" && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role,
            },
          },
        });

        if (signupError) {
          throw signupError;
        }

        if (!data.user) {
          throw new Error("Account could not be created.");
        }

        if (data.session) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert(
              {
                id: data.user.id,
                full_name: fullName.trim(),
                email: email.trim(),
                role,
              },
              {
                onConflict: "id",
              }
            );

          if (profileError) {
            console.warn("Profile creation warning:", profileError);
          }

          router.push(role === "worker" ? "/worker" : "/customer");
          router.refresh();
          return;
        }

        setMessage(
          "Account created. Check your email to confirm your account, then sign in."
        );

        setMode("login");
        setPassword("");
        return;
      }

      const authResponse = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      const user = authResponse.data.user;
      const loginError = authResponse.error;

      if (loginError) {
        throw loginError;
      }

      if (!user) {
        throw new Error("Login failed. Please try again.");
      }

      const profileResponse = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .maybeSingle();

      const profile = profileResponse.data;

      if (profileResponse.error) {
        console.warn("Could not load profile:", profileResponse.error);
      }

      if (profile?.role === "admin") {
        router.push("/admin");
      } else if (profile?.role === "worker") {
        router.push("/worker");
      } else {
        router.push("/customer");
      }

      router.refresh();
    } catch (err) {
      console.error("Authentication error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at 15% 10%, rgba(139,92,246,0.20), transparent 28%), radial-gradient(circle at 85% 20%, rgba(59,130,246,0.18), transparent 28%), #050816",
      }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 100%, rgba(99,102,241,0.12), transparent 35%)",
        }}
      />

      {/* NAVBAR */}
      <nav className="relative z-10 border-b border-white/10 bg-[#050816]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black text-white shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)",
              }}
            >
              S
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">
                SEVA-COOP
              </div>

              <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
                Community Powered
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* MAIN */}
      <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-12">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute left-[8%] top-[15%] h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[10%] right-[8%] h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-2xl lg:grid-cols-[1fr_0.9fr]">
          {/* LEFT SIDE */}
          <div className="relative hidden overflow-hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between">
            <div
              className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
              style={{
                background:
                  "linear-gradient(135deg, #8b5cf6, #3b82f6)",
              }}
            />

            <div className="relative">
              <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                Community platform
              </div>

              <h1 className="max-w-lg text-5xl font-black leading-[1.05] tracking-[-0.04em]">
                One platform.
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #a78bfa, #60a5fa)",
                  }}
                >
                  Stronger communities.
                </span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-white/50">
                Access local services, manage requests and connect with
                people and resources around your community.
              </p>
            </div>

            <div className="relative mt-12 grid grid-cols-2 gap-3">
              {[
                ["⚡", "Local Services"],
                ["🛠️", "Shared Tools"],
                ["📍", "Nearby Help"],
                ["🤝", "Community"],
              ].map(([icon, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]"
                >
                  <div className="text-xl">{icon}</div>
                  <div className="mt-2 text-sm font-semibold text-white/80">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="p-6 sm:p-10">
            <div className="mx-auto max-w-md">
              {/* Toggle */}
              <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-black/20 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setMessage("");
                  }}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    mode === "login"
                      ? "bg-white/10 text-white shadow-lg"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setMessage("");
                  }}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    mode === "signup"
                      ? "bg-white/10 text-white shadow-lg"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div className="mt-8">
                <p className="text-sm font-semibold text-violet-400">
                  {mode === "login" ? "Welcome back" : "Get started"}
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight">
                  {mode === "login"
                    ? "Sign in to SEVA-COOP"
                    : "Create your account"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/40">
                  {mode === "login"
                    ? "Continue to your personalized community dashboard."
                    : "Join your local network and start using SEVA-COOP."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {mode === "signup" && (
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">
                      Full name
                    </label>

                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-violet-500/10"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    Email address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                {mode === "signup" && (
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">
                      Account type
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("customer")}
                        className={`rounded-2xl border p-4 text-left transition ${
                          role === "customer"
                            ? "border-violet-400/50 bg-violet-500/10"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="text-xl">👤</div>
                        <div className="mt-2 text-sm font-bold">
                          Customer
                        </div>
                        <div className="mt-1 text-xs text-white/35">
                          Find services
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole("worker")}
                        className={`rounded-2xl border p-4 text-left transition ${
                          role === "worker"
                            ? "border-blue-400/50 bg-blue-500/10"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="text-xl">🧰</div>
                        <div className="mt-2 text-sm font-bold">
                          Worker
                        </div>
                        <div className="mt-1 text-xs text-white/35">
                          Provide services
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-300">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-2xl px-5 py-4 text-sm font-bold text-white shadow-xl transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)",
                  }}
                >
                  <span className="relative z-10">
                    {loading
                      ? "Authenticating..."
                      : mode === "login"
                        ? "Sign In →"
                        : "Create Account →"}
                  </span>
                </button>
              </form>

              <div className="mt-8 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-widest text-white/25">
                  SEVA-COOP
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-white/25">
                Your account connects you to services, requests and community
                resources available through SEVA-COOP.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}