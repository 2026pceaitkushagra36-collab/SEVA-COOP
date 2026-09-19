"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Service = {
  title: string;
  description: string;
  icon: string;
  category: string;
  popular?: boolean;
};

const services: Service[] = [
  {
    title: "Home Services",
    description: "Cleaning, repairs, maintenance and more.",
    icon: "🏠",
    category: "Home",
    popular: true,
  },
  {
    title: "Electrician",
    description: "Find verified electricians near you.",
    icon: "⚡",
    category: "Repair",
    popular: true,
  },
  {
    title: "Plumbing",
    description: "Quick and reliable plumbing services.",
    icon: "🔧",
    category: "Repair",
  },
  {
    title: "Healthcare",
    description: "Access local healthcare assistance.",
    icon: "❤️",
    category: "Health",
  },
  {
    title: "Education",
    description: "Tutors and learning support nearby.",
    icon: "📚",
    category: "Education",
  },
  {
    title: "Transportation",
    description: "Local transport and delivery services.",
    icon: "🛵",
    category: "Transport",
  },
  {
    title: "Agriculture",
    description: "Connect with agricultural services.",
    icon: "🌱",
    category: "Agriculture",
  },
  {
    title: "Other Services",
    description: "Explore more services in your community.",
    icon: "✨",
    category: "Other",
  },
];

const requests = [
  {
    service: "Electrician",
    provider: "Verified Local Provider",
    date: "18 Sep 2026",
    status: "In Progress",
    progress: 65,
    icon: "⚡",
  },
  {
    service: "Home Cleaning",
    provider: "Local Service Provider",
    date: "16 Sep 2026",
    status: "Completed",
    progress: 100,
    icon: "🏠",
  },
  {
    service: "Plumbing",
    provider: "Verified Local Provider",
    date: "12 Sep 2026",
    status: "Completed",
    progress: 100,
    icon: "🔧",
  },
];

const categories = [
  "All",
  "Home",
  "Repair",
  "Health",
  "Education",
  "Transport",
  "Agriculture",
  "Other",
];

export default function DashboardPage() {
  // Dark mode starts ON
  const [darkMode, setDarkMode] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [pincode, setPincode] = useState("");
  const [savedPincode, setSavedPincode] = useState("");
  const [showPincode, setShowPincode] = useState(false);

  const [showAllRequests, setShowAllRequests] = useState(false);

  // Update the complete browser background when theme changes
  useEffect(() => {
    const background = darkMode ? "#070B18" : "#F8FAFC";

    document.body.style.backgroundColor = background;
    document.documentElement.style.backgroundColor = background;

    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
    };
  }, [darkMode]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        service.title.toLowerCase().includes(searchText) ||
        service.description.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" || service.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const visibleRequests = showAllRequests
    ? requests
    : requests.slice(0, 2);

  function savePincode() {
    if (/^\d{6}$/.test(pincode)) {
      setSavedPincode(pincode);
      setShowPincode(false);
    }
  }

  function scrollToServices() {
    document
      .getElementById("services")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  function scrollToRequests() {
    document
      .getElementById("requests")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main
      className={`min-h-screen w-full overflow-x-hidden transition-colors duration-500 ${
        darkMode
          ? "bg-[#070B18] text-slate-100"
          : "bg-[#F8FAFC] text-slate-900"
      }`}
    >
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav
        className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-colors duration-500 ${
          darkMode
            ? "border-slate-800 bg-[#080D1C]/90"
            : "border-slate-200 bg-white/90"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          {/* LOGO */}

          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-lg font-black text-white shadow-lg shadow-violet-500/20 transition duration-300 group-hover:scale-110">
              S
            </div>

            <div>
              <h1 className="font-bold tracking-tight">
                SEVA-COOP
              </h1>

              <p
                className={`hidden text-[11px] sm:block ${
                  darkMode
                    ? "text-slate-500"
                    : "text-slate-500"
                }`}
              >
                Local Services • Community • Trust
              </p>
            </div>
          </Link>

          {/* NAVIGATION */}

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className={`text-sm font-medium transition ${
                darkMode
                  ? "text-slate-400 hover:text-violet-400"
                  : "text-slate-500 hover:text-violet-600"
              }`}
            >
              Home
            </Link>

            <button
              type="button"
              onClick={scrollToServices}
              className={`text-sm font-medium transition ${
                darkMode
                  ? "text-slate-400 hover:text-violet-400"
                  : "text-slate-500 hover:text-violet-600"
              }`}
            >
              Services
            </button>

            <button
              type="button"
              onClick={scrollToRequests}
              className={`text-sm font-medium transition ${
                darkMode
                  ? "text-slate-400 hover:text-violet-400"
                  : "text-slate-500 hover:text-violet-600"
              }`}
            >
              Requests
            </button>
          </div>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-3">
            {/* THEME BUTTON */}

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className={`group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? "border-slate-700 bg-slate-800 text-yellow-300 hover:border-violet-500 hover:bg-slate-700"
                  : "border-slate-200 bg-slate-100 text-slate-700 hover:border-violet-300 hover:bg-violet-50"
              }`}
            >
              <span className="text-lg transition-transform duration-300 group-hover:rotate-12">
                {darkMode ? "☀️" : "🌙"}
              </span>
            </button>

            {/* HELP */}

            <button
              type="button"
              className={`hidden rounded-xl border px-4 py-2 text-sm font-semibold transition sm:block ${
                darkMode
                  ? "border-slate-800 text-slate-400 hover:border-violet-500 hover:text-violet-400"
                  : "border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600"
              }`}
            >
              Help
            </button>

            {/* PROFILE */}

            <button
              type="button"
              aria-label="Open profile"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 font-bold text-white shadow-lg shadow-violet-500/20 transition hover:scale-105"
            >
              K
            </button>
          </div>
        </div>
      </nav>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        className={`relative w-full overflow-hidden border-b transition-colors duration-500 ${
          darkMode
            ? "border-slate-800"
            : "border-slate-200"
        }`}
      >
        {/* Background effects */}

        <div
          className={`pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl ${
            darkMode
              ? "bg-violet-600/20"
              : "bg-violet-200/40"
          }`}
        />

        <div
          className={`pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full blur-3xl ${
            darkMode
              ? "bg-cyan-500/10"
              : "bg-cyan-100/50"
          }`}
        />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-14 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_0.7fr]">
            {/* LEFT */}

            <div>
              <div
                className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${
                  darkMode
                    ? "border-violet-500/20 bg-violet-500/10 text-violet-400"
                    : "border-violet-200 bg-violet-50 text-violet-600"
                }`}
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

                YOUR COMMUNITY SERVICE HUB
              </div>

              <h2 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Everything your

                <span className="block bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  community offers.
                </span>
              </h2>

              <p
                className={`mt-6 max-w-2xl text-base leading-7 sm:text-lg ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Discover trusted local providers, request
                services and connect with your community —
                all from one platform.
              </p>

              {/* SEARCH */}

              <div
                className={`mt-8 max-w-2xl rounded-2xl border p-2 shadow-xl transition ${
                  darkMode
                    ? "border-slate-800 bg-[#111827] shadow-black/20 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10"
                    : "border-slate-200 bg-white shadow-slate-200/50 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-500/10"
                }`}
              >
                <div className="flex items-center">
                  <span className="px-3 text-xl">
                    🔎
                  </span>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="What service do you need?"
                    className={`min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none placeholder:text-slate-500 ${
                      darkMode
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={scrollToServices}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:from-violet-500 hover:to-purple-500"
                  >
                    Find
                  </button>
                </div>
              </div>

              {/* POPULAR */}

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
                <span
                  className={
                    darkMode
                      ? "text-slate-500"
                      : "text-slate-500"
                  }
                >
                  Popular:
                </span>

                {[
                  "Electrician",
                  "Plumbing",
                  "Home Services",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSearch(item);
                      scrollToServices();
                    }}
                    className={`rounded-full border px-3 py-1.5 font-semibold transition ${
                      darkMode
                        ? "border-violet-500/20 bg-violet-500/5 text-violet-400 hover:bg-violet-500/10"
                        : "border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* PINCODE CARD */}

            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 p-7 text-white shadow-2xl shadow-violet-900/30">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />

              <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-purple-400/20 blur-2xl" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-violet-200">
                      SERVICE AREA
                    </p>

                    <h3 className="mt-2 text-3xl font-black">
                      {savedPincode || "Your Pincode"}
                    </h3>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur">
                    📍
                  </div>
                </div>

                <p className="mt-6 text-sm leading-6 text-violet-100">
                  Set your area pincode to discover services
                  and providers available near your
                  community.
                </p>

                {!showPincode ? (
                  <button
                    type="button"
                    onClick={() => setShowPincode(true)}
                    className="mt-7 w-full rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-violet-700 transition hover:scale-[1.02] hover:bg-violet-50"
                  >
                    {savedPincode
                      ? "Change Pincode →"
                      : "Set Pincode →"}
                  </button>
                ) : (
                  <div className="mt-6">
                    <input
                      value={pincode}
                      onChange={(e) =>
                        setPincode(
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        )
                      }
                      placeholder="Enter 6-digit pincode"
                      inputMode="numeric"
                      maxLength={6}
                      className="w-full rounded-xl border-0 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={savePincode}
                        disabled={pincode.length !== 6}
                        className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowPincode(false)
                        }
                        className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="mx-auto w-full max-w-7xl px-5 pt-8 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            number="12"
            label="Available Services"
            icon="🛠️"
            darkMode={darkMode}
          />

          <StatCard
            number="08"
            label="Nearby Providers"
            icon="👥"
            darkMode={darkMode}
          />

          <StatCard
            number="02"
            label="Active Requests"
            icon="⏳"
            darkMode={darkMode}
          />

          <StatCard
            number="05"
            label="Completed"
            icon="✓"
            darkMode={darkMode}
          />
        </div>
      </section>

      {/* =====================================================
          SERVICES
      ====================================================== */}

      <section
        id="services"
        className="mx-auto w-full max-w-7xl px-5 py-16 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-500">
              Explore Services
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              What do you need today?
            </h2>

            <p
              className={`mt-3 ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Choose a category or search for a specific
              service.
            </p>
          </div>

          {/* CATEGORY FILTERS */}

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  category === item
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20"
                    : darkMode
                    ? "border border-slate-800 bg-[#111827] text-slate-400 hover:border-violet-500 hover:text-violet-400"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-violet-300 hover:text-violet-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* SERVICE CARDS */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredServices.map((service) => (
            <button
              key={service.title}
              type="button"
              onClick={() => setSelectedService(service)}
              className={`group relative overflow-hidden rounded-3xl border p-6 text-left shadow-sm transition duration-300 hover:-translate-y-2 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/10 ${
                darkMode
                  ? "border-slate-800 bg-[#111827]"
                  : "border-slate-200 bg-white"
              }`}
            >
              {service.popular && (
                <span className="absolute right-4 top-4 rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-500">
                  Popular
                </span>
              )}

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-400/10 text-2xl transition duration-300 group-hover:scale-110 group-hover:rotate-3">
                {service.icon}
              </div>

              <h3 className="mt-6 text-lg font-bold">
                {service.title}
              </h3>

              <p
                className={`mt-2 min-h-[48px] text-sm leading-6 ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {service.description}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span
                  className={`text-xs font-bold ${
                    darkMode
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                >
                  {service.category}
                </span>

                <span className="font-bold text-violet-500 transition group-hover:translate-x-1">
                  Explore →
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* NO RESULTS */}

        {filteredServices.length === 0 && (
          <div
            className={`mt-8 rounded-3xl border border-dashed p-12 text-center ${
              darkMode
                ? "border-slate-700 bg-[#111827]"
                : "border-slate-300 bg-white"
            }`}
          >
            <div className="text-4xl">
              🔎
            </div>

            <h3 className="mt-4 font-bold">
              No services found
            </h3>

            <p
              className={`mt-2 text-sm ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Try another search or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* =====================================================
          REQUESTS
      ====================================================== */}

      <section
        id="requests"
        className={`w-full border-y transition-colors ${
          darkMode
            ? "border-slate-800 bg-[#0B1020]"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto w-full max-w-7xl px-5 py-16 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-500">
                Activity
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Recent Requests
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowAllRequests(!showAllRequests)
              }
              className="text-sm font-bold text-violet-500 transition hover:text-violet-400"
            >
              {showAllRequests
                ? "Show less ↑"
                : "View all →"}
            </button>
          </div>

          <div className="mt-8 space-y-4">
            {visibleRequests.map((request) => (
              <div
                key={`${request.service}-${request.date}`}
                className={`group rounded-2xl border p-5 transition hover:border-violet-400 hover:shadow-lg hover:shadow-violet-500/5 ${
                  darkMode
                    ? "border-slate-800 bg-[#111827]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <div className="flex flex-1 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-xl transition group-hover:scale-105">
                      {request.icon}
                    </div>

                    <div>
                      <h3 className="font-bold">
                        {request.service}
                      </h3>

                      <p
                        className={`mt-1 text-xs ${
                          darkMode
                            ? "text-slate-500"
                            : "text-slate-500"
                        }`}
                      >
                        {request.provider}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-32">
                    <p className="text-xs text-slate-500">
                      REQUESTED
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {request.date}
                    </p>
                  </div>

                  <div className="w-full md:w-48">
                    <div className="mb-2 flex justify-between text-xs">
                      <span
                        className={
                          darkMode
                            ? "text-slate-500"
                            : "text-slate-500"
                        }
                      >
                        Progress
                      </span>

                      <span className="font-bold text-violet-500">
                        {request.progress}%
                      </span>
                    </div>

                    <div
                      className={`h-2 overflow-hidden rounded-full ${
                        darkMode
                          ? "bg-slate-800"
                          : "bg-slate-200"
                      }`}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-400 transition-all duration-700"
                        style={{
                          width: `${request.progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
                      request.status === "Completed"
                        ? "bg-cyan-400/10 text-cyan-500"
                        : "bg-amber-400/10 text-amber-500"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="mx-auto w-full max-w-7xl px-5 py-16 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#15102D] via-[#111827] to-[#071A24] p-8 text-white sm:p-12">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

          <div className="absolute -bottom-20 left-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
              SEVA-COOP COMMUNITY
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Your community.

              <span className="block text-violet-400">
                Your services.
              </span>
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Discover local providers, support your
              community and make everyday services easier
              to access.
            </p>

            <button
              type="button"
              onClick={scrollToServices}
              className="mt-7 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:from-violet-500 hover:to-purple-500"
            >
              Explore Services →
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer
        className={`w-full border-t ${
          darkMode
            ? "border-slate-800"
            : "border-slate-200"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p
            className={
              darkMode
                ? "text-slate-500"
                : "text-slate-500"
            }
          >
            © 2026 SEVA-COOP. Built for stronger local
            communities.
          </p>

          <div className="flex gap-5">
            <button
              type="button"
              className="text-slate-500 transition hover:text-violet-500"
            >
              Privacy
            </button>

            <button
              type="button"
              className="text-slate-500 transition hover:text-violet-500"
            >
              Terms
            </button>

            <button
              type="button"
              className="text-slate-500 transition hover:text-violet-500"
            >
              Support
            </button>
          </div>
        </div>
      </footer>

      {/* =====================================================
          SERVICE MODAL
      ====================================================== */}

      {selectedService && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
          onClick={() => setSelectedService(null)}
        >
          <div
            className={`w-full max-w-md rounded-3xl border p-7 shadow-2xl ${
              darkMode
                ? "border-slate-800 bg-[#111827]"
                : "border-slate-200 bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">
                {selectedService.icon}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedService(null)
                }
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                  darkMode
                    ? "bg-slate-800 text-slate-400 hover:bg-violet-500/10 hover:text-violet-400"
                    : "bg-slate-100 text-slate-500 hover:bg-violet-50 hover:text-violet-600"
                }`}
              >
                ✕
              </button>
            </div>

            <h2 className="mt-6 text-2xl font-black">
              {selectedService.title}
            </h2>

            <p
              className={`mt-3 leading-7 ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              {selectedService.description}
            </p>

            <div className="mt-6 rounded-2xl bg-violet-500/10 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-500">
                Service category
              </p>

              <p className="mt-1 font-bold text-violet-400">
                {selectedService.category}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedService(null);
                scrollToRequests();
              }}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 text-sm font-bold text-white transition hover:from-violet-500 hover:to-purple-500"
            >
              Request This Service →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  number,
  label,
  icon,
  darkMode,
}: {
  number: string;
  label: string;
  icon: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`group rounded-2xl border p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/10 ${
        darkMode
          ? "border-slate-800 bg-[#111827]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-black tracking-tight transition group-hover:text-violet-500">
            {number}
          </p>

          <p
            className={`mt-1 text-xs font-semibold sm:text-sm ${
              darkMode
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            {label}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl transition group-hover:scale-110 ${
            darkMode
              ? "bg-violet-500/10"
              : "bg-violet-50"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}