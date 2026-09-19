"use client";

import Link from "next/link";
import { useState } from "react";

const services = [
  {
    icon: "⚡",
    title: "Electrical",
    description: "Reliable electrical repair and maintenance.",
  },
  {
    icon: "🔧",
    title: "Plumbing",
    description: "Quick plumbing support for homes and businesses.",
  },
  {
    icon: "🏠",
    title: "Home Services",
    description: "Trusted help for everyday household needs.",
  },
  {
    icon: "🩺",
    title: "Healthcare",
    description: "Connect with local healthcare services.",
  },
  {
    icon: "📚",
    title: "Education",
    description: "Access learning and educational support.",
  },
  {
    icon: "🌱",
    title: "Agriculture",
    description: "Support for farmers and agricultural needs.",
  },
];

const stats = [
  {
    value: "24/7",
    label: "Service Access",
  },
  {
    value: "100%",
    label: "Community Focused",
  },
  {
    value: "1",
    label: "Connected Platform",
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute right-[-120px] top-[20%] h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute bottom-[-180px] left-[35%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/[0.07] bg-[#050816]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-blue-500/10 shadow-lg shadow-violet-500/10">
              <span className="text-xl">✦</span>
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">
                SEVA<span className="text-violet-400">-COOP</span>
              </div>

              <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/35">
                Community Services
              </div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/"
              className="rounded-xl bg-white/[0.07] px-4 py-2.5 text-sm font-medium text-white"
            >
              Home
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/customer"
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white"
            >
              Services
            </Link>

            <Link
              href="/login"
              className="ml-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:from-violet-400 hover:to-indigo-400"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white md:hidden"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>

        {/* Mobile navigation */}
        {menuOpen && (
          <div className="border-t border-white/[0.07] px-5 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-white/[0.07] px-4 py-3 text-sm text-white"
              >
                Home
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-white/60 hover:bg-white/[0.05] hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                href="/customer"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-white/60 hover:bg-white/[0.05] hover:text-white"
              >
                Services
              </Link>

              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-xl bg-violet-500 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pb-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Hero copy */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/[0.08] px-3.5 py-2 text-xs font-medium text-violet-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Community-powered service network
              </div>

              <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                Services that
                <span className="block bg-gradient-to-r from-violet-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  connect communities.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
                SEVA-COOP connects customers, skilled workers and
                community resources through one simple digital
                platform.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/20 transition hover:-translate-y-0.5 hover:from-violet-400 hover:to-indigo-400"
                >
                  Get Started
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-6 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-xl transition hover:bg-white/[0.08] hover:text-white"
                >
                  Explore Dashboard
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid max-w-xl grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur-xl"
                  >
                    <div className="text-xl font-bold text-white sm:text-2xl">
                      {stat.value}
                    </div>

                    <div className="mt-1 text-[10px] uppercase tracking-wider text-white/35 sm:text-xs">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero dashboard preview */}
            <div className="relative">
              <div className="absolute -inset-8 rounded-[3rem] bg-violet-500/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-5">
                {/* Fake browser header */}
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  </div>

                  <div className="rounded-lg border border-white/5 bg-black/10 px-5 py-1.5 text-[9px] text-white/25">
                    seva-coop / dashboard
                  </div>

                  <span className="text-xs text-white/20">
                    ⋯
                  </span>
                </div>

                {/* Dashboard preview */}
                <div className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-violet-300/70">
                        Overview
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-white">
                        Community Dashboard
                      </h3>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                      ◐
                    </div>
                  </div>

                  {/* Mini stats */}
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3">
                      <p className="text-[8px] text-white/35">
                        REQUESTS
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        24
                      </p>

                      <p className="text-[8px] text-emerald-300">
                        +12%
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3">
                      <p className="text-[8px] text-white/35">
                        ACTIVE
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        08
                      </p>

                      <p className="text-[8px] text-cyan-300">
                        Live
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3">
                      <p className="text-[8px] text-white/35">
                        COMPLETED
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        91
                      </p>

                      <p className="text-[8px] text-violet-300">
                        This month
                      </p>
                    </div>
                  </div>

                  {/* Request preview */}
                  <div className="mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-white/80">
                        Recent Requests
                      </p>

                      <span className="text-[9px] text-violet-300">
                        View all →
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {[
                        ["⚡", "Electrical Repair", "In Progress"],
                        ["🔧", "Plumbing", "Accepted"],
                        ["🏠", "Home Services", "Completed"],
                      ].map(([icon, title, status]) => (
                        <div
                          key={title}
                          className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-black/10 p-2.5"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-sm">
                            {icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[10px] font-medium text-white/75">
                              {title}
                            </p>

                            <p className="mt-0.5 text-[8px] text-white/30">
                              Community service request
                            </p>
                          </div>

                          <span className="rounded-full bg-violet-500/10 px-2 py-1 text-[8px] text-violet-300">
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom card */}
                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-violet-400/10 bg-gradient-to-r from-violet-500/[0.08] to-blue-500/[0.04] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-lg">
                      ✦
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-white/80">
                        Everything connected
                      </p>

                      <p className="mt-0.5 text-[9px] text-white/35">
                        Customers • Workers • Community
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
              Our Services
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              One platform.
              <span className="text-white/40">
                {" "}
                Many ways to help.
              </span>
            </h2>

            <p className="mt-4 text-sm leading-6 text-white/45 sm:text-base">
              Request the support you need and connect with the
              right community service provider.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.title}
                href="/customer"
                className="group rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:bg-white/[0.055] hover:shadow-xl hover:shadow-violet-500/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.05] text-xl transition group-hover:scale-105">
                  {service.icon}
                </div>

                <h3 className="mt-5 text-base font-semibold text-white">
                  {service.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/40">
                  {service.description}
                </p>

                <div className="mt-5 text-xs font-semibold text-violet-300 opacity-70 transition group-hover:opacity-100">
                  Request service →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-xl sm:p-10 lg:p-12">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Simple Workflow
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  From request to
                  <span className="text-violet-300">
                    {" "}
                    resolution.
                  </span>
                </h2>

                <p className="mt-4 text-sm leading-6 text-white/45">
                  SEVA-COOP keeps the entire service journey in one
                  connected workflow.
                </p>

                <Link
                  href="/login"
                  className="mt-7 inline-flex rounded-xl bg-white/[0.07] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.11]"
                >
                  Join SEVA-COOP →
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  {
                    number: "01",
                    title: "Create a request",
                    text: "Tell us what service you need and when you need it.",
                  },
                  {
                    number: "02",
                    title: "Get connected",
                    text: "Your request becomes visible to suitable service workers.",
                  },
                  {
                    number: "03",
                    title: "Track progress",
                    text: "Follow your request from accepted to in progress.",
                  },
                  {
                    number: "04",
                    title: "Complete",
                    text: "The worker completes the service and closes the request.",
                  },
                ].map((step) => (
                  <div
                    key={step.number}
                    className="flex gap-4 rounded-2xl border border-white/[0.06] bg-black/10 p-4 transition hover:border-violet-400/15 hover:bg-white/[0.03]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10 text-xs font-bold text-violet-300">
                      {step.number}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {step.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-white/40">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-violet-400/10 bg-gradient-to-br from-violet-500/[0.12] via-indigo-500/[0.07] to-blue-500/[0.04] p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-2xl">
                ✦
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to get started?
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/45">
                Join the SEVA-COOP community and make accessing
                local services simpler.
              </p>

              <Link
                href="/login"
                className="mt-7 inline-flex rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/20 transition hover:-translate-y-0.5 hover:from-violet-400 hover:to-indigo-400"
              >
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="text-sm font-bold">
              SEVA<span className="text-violet-400">-COOP</span>
            </div>

            <p className="mt-1 text-xs text-white/30">
              Connecting communities through service.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-xs text-white/35">
            <Link
              href="/dashboard"
              className="transition hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/customer"
              className="transition hover:text-white"
            >
              Services
            </Link>

            <Link
              href="/worker"
              className="transition hover:text-white"
            >
              Worker Portal
            </Link>

            <Link
              href="/login"
              className="transition hover:text-white"
            >
              Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}