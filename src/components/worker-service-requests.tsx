
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  acceptServiceRequest,
  completeServiceRequest,
  rejectServiceRequest,
  startServiceRequest,
  type ServiceRequestStatus,
} from "@/services/seva-data";
import {
  hasSupabaseConfig,
  supabase,
} from "@/lib/supabase/client";

type RequestStatus = ServiceRequestStatus | string;

type ServiceRequest = {
  id: string;
  customer_id: string;
  service_id: string;
  service_area_id: string;
  assigned_worker_id: string | null;
  title: string;
  description: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: RequestStatus;
  created_at: string;

  services?: {
    name: string;
  }[] | null;

  service_areas?: {
    pincode: string;
  }[] | null;
};

type StatusConfig = {
  label: string;
  className: string;
};

const statusConfig: Record<string, StatusConfig> = {
  pending: {
    label: "Pending",
    className:
      "bg-amber-500/15 text-amber-300 border-amber-400/20",
  },
  matching: {
    label: "Looking for Worker",
    className:
      "bg-blue-500/15 text-blue-300 border-blue-400/20",
  },
  assigned: {
    label: "Assigned",
    className:
      "bg-violet-500/15 text-violet-300 border-violet-400/20",
  },
  accepted: {
    label: "Accepted",
    className:
      "bg-cyan-500/15 text-cyan-300 border-cyan-400/20",
  },
  in_progress: {
    label: "In Progress",
    className:
      "bg-indigo-500/15 text-indigo-300 border-indigo-400/20",
  },
  completed: {
    label: "Completed",
    className:
      "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-red-500/15 text-red-300 border-red-400/20",
  },
};

function getStatusConfig(status: string): StatusConfig {
  return (
    statusConfig[status] ?? {
      label: status.replace(/_/g, " "),
      className:
        "bg-white/10 text-white/70 border-white/10",
    }
  );
}

function getServiceIcon(serviceName: string): string {
  const name = serviceName.toLowerCase();

  if (name.includes("electric")) return "⚡";
  if (name.includes("plumb")) return "🔧";
  if (name.includes("carpent")) return "🪚";
  if (name.includes("paint")) return "🎨";
  if (name.includes("washing")) return "🧺";
  if (name.includes("ac")) return "❄️";
  if (name.includes("home")) return "🏠";
  if (name.includes("health")) return "🩺";
  if (name.includes("education")) return "📚";
  if (name.includes("transport")) return "🚚";
  if (name.includes("agri")) return "🌱";

  return "🛠️";
}

function formatDate(date: string | null): string {
  if (!date) return "Not specified";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WorkerServiceRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<ServiceRequest | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /*
   * Load service requests for the logged-in worker.
   *
   * We keep the enriched query here because the Worker UI
   * needs service names and service-area pincodes for display.
   * All request mutations use the shared service layer.
   */
  const loadRequests = useCallback(async () => {
    if (!hasSupabaseConfig || !supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);

      const sessionResponse = await supabase.auth.getSession();
      const user = sessionResponse.data.session?.user ?? null;

      if (!user) {
        setRequests([]);
        setError(
          "Please log in as a worker to view service requests.",
        );
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const { data, error: requestError } = await supabase
        .from("service_requests")
        .select(`
          id,
          customer_id,
          service_id,
          service_area_id,
          assigned_worker_id,
          title,
          description,
          preferred_date,
          preferred_time,
          status,
          created_at,
          services (
            name
          ),
          service_areas (
            pincode
          )
        `)
        .or(
          `assigned_worker_id.is.null,assigned_worker_id.eq.${user.id}`,
        )
        .order("created_at", {
          ascending: false,
        });

      if (requestError) {
        throw requestError;
      }

      setRequests((data ?? []) as ServiceRequest[]);
    } catch (requestError) {
      console.error(
        "Failed to load service requests:",
        requestError,
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load service requests.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /*
   * Initial load + automatic refresh.
   */
  useEffect(() => {
    void loadRequests();

    const interval = window.setInterval(() => {
      void loadRequests();
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadRequests]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
  };

  /*
   * Accept a request.
   *
   * Uses the shared service layer so the same business
   * logic is used everywhere in the application.
   */
  const acceptRequest = async (request: ServiceRequest) => {
    setUpdatingId(request.id);
    setError(null);

    try {
      const result = await acceptServiceRequest(request.id);

      if (!result.success) {
        throw new Error(
          result.error ?? "Failed to accept request.",
        );
      }

      await loadRequests();
      setSelectedRequest(null);
    } catch (updateError) {
      console.error(
        "Failed to accept service request:",
        updateError,
      );

      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to accept request.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
   * Reject / release a request.
   */
  const rejectRequest = async (request: ServiceRequest) => {
    setUpdatingId(request.id);
    setError(null);

    try {
      const result = await rejectServiceRequest(request.id);

      if (!result.success) {
        throw new Error(
          result.error ?? "Failed to reject request.",
        );
      }

      await loadRequests();
      setSelectedRequest(null);
    } catch (updateError) {
      console.error(
        "Failed to reject service request:",
        updateError,
      );

      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to reject request.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
   * Start work on an accepted request.
   */
  const startRequest = async (request: ServiceRequest) => {
    setUpdatingId(request.id);
    setError(null);

    try {
      const result = await startServiceRequest(request.id);

      if (!result.success) {
        throw new Error(
          result.error ?? "Failed to start work.",
        );
      }

      await loadRequests();

      setSelectedRequest((current) => {
        if (!current || current.id !== request.id) {
          return current;
        }

        return {
          ...current,
          status: "in_progress",
        };
      });
    } catch (updateError) {
      console.error(
        "Failed to start service request:",
        updateError,
      );

      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to start work.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
   * Complete an active request.
   */
  const completeRequest = async (
    request: ServiceRequest,
  ) => {
    setUpdatingId(request.id);
    setError(null);

    try {
      const result = await completeServiceRequest(
        request.id,
      );

      if (!result.success) {
        throw new Error(
          result.error ?? "Failed to complete request.",
        );
      }

      await loadRequests();
      setSelectedRequest(null);
    } catch (updateError) {
      console.error(
        "Failed to complete service request:",
        updateError,
      );

      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to complete request.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    const pending = requests.filter(
      (request) =>
        request.status === "pending" ||
        request.status === "matching",
    ).length;

    const active = requests.filter(
      (request) =>
        request.status === "assigned" ||
        request.status === "accepted" ||
        request.status === "in_progress",
    ).length;

    const completed = requests.filter(
      (request) => request.status === "completed",
    ).length;

    return {
      pending,
      active,
      completed,
      total: requests.length,
    };
  }, [requests]);

  const visibleRequests = useMemo(() => {
    return requests;
  }, [requests]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Live Requests
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Service Requests
          </h2>

          <p className="mt-1 max-w-2xl text-sm text-white/55">
            View nearby customer requests, accept jobs, start work,
            and update completed services.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={refreshing ? "animate-spin" : ""}>
            ↻
          </span>

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">⚠️</span>

            <div>
              <p className="font-medium text-red-200">
                Unable to process service request
              </p>

              <p className="mt-1 text-sm text-red-200/70">
                {error}
              </p>

              {error.toLowerCase().includes("log in") && (
                <a
                  href="/login"
                  className="mt-3 inline-flex rounded-lg bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/30"
                >
                  Go to Login
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            New Requests
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {stats.pending}
          </p>

          <p className="mt-1 text-xs text-amber-300/80">
            Waiting for worker
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Active Jobs
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {stats.active}
          </p>

          <p className="mt-1 text-xs text-cyan-300/80">
            Currently assigned
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Completed
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {stats.completed}
          </p>

          <p className="mt-1 text-xs text-emerald-300/80">
            Successfully finished
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Total Requests
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {stats.total}
          </p>

          <p className="mt-1 text-xs text-violet-300/80">
            In your request feed
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="h-5 w-1/3 rounded bg-white/10" />

              <div className="mt-4 h-4 w-2/3 rounded bg-white/10" />

              <div className="mt-3 h-16 rounded-xl bg-white/5" />

              <div className="mt-4 h-10 rounded-xl bg-white/10" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && visibleRequests.length === 0 && !error && (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-3xl">
            🛠️
          </div>

          <h3 className="mt-5 text-lg font-semibold text-white">
            No service requests yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
            New customer requests will appear here automatically.
            This page checks for new requests every 10 seconds.
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="mt-5 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Check Again
          </button>
        </div>
      )}

      {/* Request cards */}
      {!loading && visibleRequests.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleRequests.map((request) => {
            const serviceName =
              request.services?.[0]?.name ||
              request.title ||
              "Service Request";

            const status = getStatusConfig(request.status);

            const isUpdating =
              updatingId === request.id;

            const canAccept =
              (request.status === "pending" ||
                request.status === "matching") &&
              !request.assigned_worker_id;

            const isAssigned =
              request.assigned_worker_id !== null;

            const canStart =
              isAssigned &&
              (request.status === "accepted" ||
                request.status === "assigned");

            const canComplete =
              isAssigned &&
              request.status === "in_progress";

            return (
              <article
                key={request.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-violet-400/20 hover:bg-white/[0.06]"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl transition group-hover:bg-violet-500/20" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-2xl">
                      {getServiceIcon(serviceName)}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-white">
                        {serviceName}
                      </h3>

                      <p className="mt-0.5 text-xs text-white/40">
                        Request #{request.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="relative mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/5 bg-black/10 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-white/35">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-medium text-white/80">
                      {request.service_areas?.[0]?.pincode ||
                        "Not specified"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-black/10 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-white/35">
                      Preferred Date
                    </p>

                    <p className="mt-1 text-sm font-medium text-white/80">
                      {formatDate(request.preferred_date)}
                    </p>
                  </div>
                </div>

                <div className="relative mt-3 rounded-xl border border-white/5 bg-black/10 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-white/35">
                    Customer Notes
                  </p>

                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/65">
                    {request.description ||
                      "No additional instructions provided."}
                  </p>
                </div>

                <p className="relative mt-3 text-[11px] text-white/30">
                  Requested {formatDateTime(request.created_at)}
                </p>

                <div className="relative mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRequest(request)
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-xs font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    View Details
                  </button>

                  {canAccept && (
                    <>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          void acceptRequest(request)
                        }
                        className="rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUpdating
                          ? "Accepting..."
                          : "Accept Request"}
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          void rejectRequest(request)
                        }
                        className="rounded-xl border border-red-400/15 bg-red-500/10 px-3.5 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {canStart && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        void startRequest(request)
                      }
                      className="rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isUpdating
                        ? "Starting..."
                        : "Start Work"}
                    </button>
                  )}

                  {canComplete && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        void completeRequest(request)
                      }
                      className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isUpdating
                        ? "Completing..."
                        : "Mark Completed"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Details modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRequest(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#0b1020] p-6 shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                  Request Details
                </p>

                <h3 className="mt-2 text-xl font-bold text-white">
                  {selectedRequest.services?.[0]?.name ||
                    selectedRequest.title ||
                    "Service Request"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRequest(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs text-white/35">
                  Status
                </p>

                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      getStatusConfig(
                        selectedRequest.status,
                      ).className
                    }`}
                  >
                    {
                      getStatusConfig(
                        selectedRequest.status,
                      ).label
                    }
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-white/35">
                    Pincode
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    {selectedRequest.service_areas?.[0]
                      ?.pincode || "Not specified"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-white/35">
                    Preferred Date
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    {formatDate(
                      selectedRequest.preferred_date,
                    )}
                  </p>
                </div>
              </div>

              {selectedRequest.preferred_time && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-white/35">
                    Preferred Time
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    {selectedRequest.preferred_time}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs text-white/35">
                  Customer Notes
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/70">
                  {selectedRequest.description ||
                    "No additional instructions provided."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs text-white/35">
                  Request ID
                </p>

                <p className="mt-1 break-all font-mono text-xs text-white/60">
                  {selectedRequest.id}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs text-white/35">
                  Created
                </p>

                <p className="mt-1 text-sm text-white/70">
                  {formatDateTime(
                    selectedRequest.created_at,
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {(selectedRequest.status === "pending" ||
                selectedRequest.status === "matching") &&
                !selectedRequest.assigned_worker_id && (
                  <>
                    <button
                      type="button"
                      disabled={
                        updatingId === selectedRequest.id
                      }
                      onClick={() =>
                        void acceptRequest(
                          selectedRequest,
                        )
                      }
                      className="flex-1 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-50"
                    >
                      {updatingId === selectedRequest.id
                        ? "Accepting..."
                        : "Accept Request"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        updatingId === selectedRequest.id
                      }
                      onClick={() =>
                        void rejectRequest(
                          selectedRequest,
                        )
                      }
                      className="rounded-xl border border-red-400/15 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/15 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}

              {(selectedRequest.status === "accepted" ||
                selectedRequest.status === "assigned") &&
                selectedRequest.assigned_worker_id && (
                  <button
                    type="button"
                    disabled={
                      updatingId === selectedRequest.id
                    }
                    onClick={() =>
                      void startRequest(
                        selectedRequest,
                      )
                    }
                    className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-50"
                  >
                    {updatingId === selectedRequest.id
                      ? "Starting..."
                      : "Start Work"}
                  </button>
                )}

              {selectedRequest.status === "in_progress" &&
                selectedRequest.assigned_worker_id && (
                  <button
                    type="button"
                    disabled={
                      updatingId === selectedRequest.id
                    }
                    onClick={() =>
                      void completeRequest(
                        selectedRequest,
                      )
                    }
                    className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {updatingId === selectedRequest.id
                      ? "Completing..."
                      : "Mark Completed"}
                  </button>
                )}

              <button
                type="button"
                onClick={() =>
                  setSelectedRequest(null)
                }
                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}