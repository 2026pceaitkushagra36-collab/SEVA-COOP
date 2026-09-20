"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusPill } from "@/components/ui/status-pill";
import { hasSupabaseConfig, supabase } from "@/lib/supabase/client";
import type { Tool } from "@/types/seva";

type ToolLibraryProps = {
  tools: Tool[];
};

type SelectedTool = Tool | null;

function getToday(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function ToolLibrary({ tools }: ToolLibraryProps) {
  const router = useRouter();

  const [selectedTool, setSelectedTool] =
    useState<SelectedTool>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const openReservation = (tool: Tool) => {
    setSelectedTool(tool);
    setStartDate("");
    setEndDate("");
    setError(null);
    setSuccess(null);
  };

  const closeReservation = () => {
    if (loading) return;

    setSelectedTool(null);
    setStartDate("");
    setEndDate("");
    setError(null);
    setSuccess(null);
  };

  const handleReservation = async () => {
    if (!selectedTool) {
      return;
    }

    setError(null);
    setSuccess(null);

    if (!startDate || !endDate) {
      setError("Please select both a start date and an end date.");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be before the start date.");
      return;
    }

    if (!hasSupabaseConfig || !supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(authError.message);
      }

      if (!user) {
        throw new Error(
          "Please log in as a customer before making a reservation.",
        );
      }

      const { error: reservationError } = await supabase
        .from("reservations")
        .insert({
          tool_id: selectedTool.id,
          customer_id: user.id,
          start_date: startDate,
          end_date: endDate,
          status: "pending",
        });

      if (reservationError) {
        throw new Error(reservationError.message);
      }

      setSuccess(
        `${selectedTool.name} has been reserved successfully.`,
      );

      setStartDate("");
      setEndDate("");

      router.refresh();

      window.setTimeout(() => {
        setSelectedTool(null);
        setSuccess(null);
      }, 1500);
    } catch (reservationError) {
      console.error(
        "Failed to create reservation:",
        reservationError,
      );

      setError(
        reservationError instanceof Error
          ? reservationError.message
          : "Failed to create reservation.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="section-block" id="tools">
        <div className="section-heading">
          <p className="eyebrow">Tool Library</p>
          <h2>Reserve the right tool from the nearest hub.</h2>
        </div>

        <div className="tool-grid">
          {tools.map((tool) => {
            const isAvailable =
              String(tool.status).toLowerCase() === "available";

            return (
              <article className="tool-card" key={tool.id}>
                <div
                  className={`tool-visual bg-gradient-to-br ${tool.imageStyle}`}
                >
                  <span>
                    {tool.category.slice(0, 2).toUpperCase()}
                  </span>
                </div>

                <div className="tool-card-body">
                  <div className="tool-card-title">
                    <div>
                      <p>{tool.category}</p>
                      <h3>{tool.name}</h3>
                    </div>

                    <StatusPill status={tool.status} />
                  </div>

                  <p className="muted">{tool.description}</p>

                  <div className="tool-meta">
                    <span>{tool.location}</span>
                    <span>{tool.demandScore}% demand</span>
                  </div>

                  <button
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => openReservation(tool)}
                    className="mt-4 w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
                  >
                    {isAvailable
                      ? "Reserve Tool"
                      : "Currently Unavailable"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {selectedTool && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReservation();
            }
          }}
        >
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1020] p-6 shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                  Tool Reservation
                </p>

                <h3 className="mt-2 text-2xl font-bold text-white">
                  {selectedTool.name}
                </h3>

                <p className="mt-1 text-sm text-white/45">
                  {selectedTool.location}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReservation}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xl text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                ×
              </button>
            </div>

            {success && (
              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">✓</span>

                  <div>
                    <p className="font-semibold text-emerald-200">
                      Reservation Created
                    </p>

                    <p className="mt-1 text-sm text-emerald-200/70">
                      {success}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">⚠️</span>

                  <div>
                    <p className="font-semibold text-red-200">
                      Reservation Failed
                    </p>

                    <p className="mt-1 text-sm text-red-200/70">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!success && (
              <>
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${selectedTool.imageStyle} text-sm font-bold text-white`}
                    >
                      {selectedTool.category
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="text-xs text-white/40">
                        {selectedTool.category}
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {selectedTool.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="reservation-start-date"
                      className="mb-2 block text-sm font-medium text-white/70"
                    >
                      Start Date
                    </label>

                    <input
                      id="reservation-start-date"
                      type="date"
                      min={getToday()}
                      value={startDate}
                      onChange={(event) =>
                        setStartDate(event.target.value)
                      }
                      disabled={loading}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white outline-none transition focus:border-violet-400/50 focus:bg-white/[0.08] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reservation-end-date"
                      className="mb-2 block text-sm font-medium text-white/70"
                    >
                      End Date
                    </label>

                    <input
                      id="reservation-end-date"
                      type="date"
                      min={startDate || getToday()}
                      value={endDate}
                      onChange={(event) =>
                        setEndDate(event.target.value)
                      }
                      disabled={loading}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white outline-none transition focus:border-violet-400/50 focus:bg-white/[0.08] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-violet-400/10 bg-violet-500/5 px-4 py-3">
                  <p className="text-xs leading-5 text-white/50">
                    Your reservation will initially be marked as{" "}
                    <span className="font-semibold text-amber-300">
                      Pending
                    </span>
                    . A worker or administrator can process the
                    reservation from the dashboard.
                  </p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={closeReservation}
                    disabled={loading}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleReservation()}
                    disabled={loading}
                    className="flex-1 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Reserving..."
                      : "Confirm Reservation"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}