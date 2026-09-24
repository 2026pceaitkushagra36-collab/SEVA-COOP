
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/app-nav";
import { ReservationBoard } from "@/components/reservation-board";
import { RoleDashboard } from "@/components/role-dashboard";
import { ToolLibrary } from "@/components/tool-library";
import {
  createServiceRequest,
  getMyServiceRequests,
  getReservations,
  getTools,
} from "@/services/seva-data";
import { hasSupabaseConfig, supabase } from "@/lib/supabase/client";
import type { Reservation, Tool } from "@/types/seva";
import type { ServiceRequest } from "@/services/seva-data";

type Service = {
  id: string;
  name: string;
  description: string | null;
};

type ServiceArea = {
  id: string;
  pincode: string;
};

type AIResult = {
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  reason: string;
  confidence: number;
  matchScore?: number;
  matchReason?: string;
};

const statusConfig: Record<
  ServiceRequest["status"],
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "Pending",
    className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },
  matching: {
    label: "Finding Worker",
    className: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  },
  assigned: {
    label: "Worker Assigned",
    className: "border-purple-400/20 bg-purple-400/10 text-purple-300",
  },
  accepted: {
    label: "Accepted",
    className: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  },
  in_progress: {
    label: "In Progress",
    className: "border-orange-400/20 bg-orange-400/10 text-orange-300",
  },
  completed: {
    label: "Completed",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-red-400/20 bg-red-400/10 text-red-300",
  },
};

const serviceIcons: Record<string, string> = {
  plumbing: "🔧",
  electrician: "⚡",
  electrical: "⚡",
  carpenter: "🪚",
  carpentry: "🪚",
  cleaning: "🧹",
  gardening: "🌱",
  painting: "🎨",
  mechanic: "🔩",
  repair: "🛠️",
  default: "🛠️",
};

function getServiceIcon(name: string) {
  const key = name.toLowerCase();

  for (const [serviceName, icon] of Object.entries(serviceIcons)) {
    if (key.includes(serviceName)) {
      return icon;
    }
  }

  return serviceIcons.default;
}

function formatDate(value: string | null) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function CustomerServiceRequests() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  const [selectedService, setSelectedService] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [aiResult, setAiResult] = useState<AIResult | null>(null);

  const [selectedRequest, setSelectedRequest] =
    useState<ServiceRequest | null>(null);

  const loadData = useCallback(async () => {
    if (!hasSupabaseConfig || !supabase) {
      setLoading(false);
      setError("Supabase is not configured.");
      return;
    }

    setError("");

    try {
      const [servicesResult, areasResult] = await Promise.all([
        supabase
          .from("services")
          .select("id,name,description")
          .order("name", { ascending: true }),

        supabase
          .from("service_areas")
          .select("id,pincode")
          .order("pincode", { ascending: true }),
      ]);

      if (servicesResult.error) {
        console.error("Failed to load services:", servicesResult.error);
        throw servicesResult.error;
      }

      if (areasResult.error) {
        console.error("Failed to load service areas:", areasResult.error);
        throw areasResult.error;
      }

      setServices((servicesResult.data ?? []) as Service[]);
      setServiceAreas((areasResult.data ?? []) as ServiceArea[]);

      try {
        const requestsData = await getMyServiceRequests();
        setRequests(requestsData);
      } catch (requestError) {
        console.error(
          "Failed to load existing service requests:",
          requestError,
        );

        setRequests([]);
      }
    } catch (err) {
      console.error("Failed to load customer service data:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load service and service area data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();

    const interval = window.setInterval(() => {
      void loadData();
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadData]);

  const activeRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status !== "completed" && request.status !== "cancelled",
      ),
    [requests],
  );

  const completedRequests = useMemo(
    () => requests.filter((request) => request.status === "completed"),
    [requests],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setAiResult(null);

    if (!selectedService) {
      setError("Please select a service.");
      return;
    }

    if (!selectedArea) {
      setError("Please select your service area.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe what you need so our AI can analyze the request.");
      return;
    }

    setSubmitting(true);

    try {
      const selectedServiceData = services.find(
        (service) => service.id === selectedService,
      );

      if (!selectedServiceData) {
        throw new Error("Selected service could not be found.");
      }

      // Step 1: Create the service request in the existing Supabase table.
      const createResult = await createServiceRequest({
        serviceId: selectedService,
        serviceAreaId: selectedArea,
        title: selectedServiceData.name,
        description,
        preferredDate: preferredDate || undefined,
        preferredTime: preferredTime || undefined,
      });

      if (!createResult.success || !createResult.request) {
        throw new Error("Unable to create service request.");
      }

      const requestId = createResult.request.id;

      // Step 2: Get the authenticated user's Supabase session.
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      // Step 3: Send the request to the real AI analysis endpoint.
      const aiResponse = await fetch("/api/ai/analyze-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          requestId,
        }),
      });

      const aiData = await aiResponse.json();

      if (!aiResponse.ok || !aiData.success) {
        throw new Error(
          aiData.error || "AI analysis failed for this request.",
        );
      }

      // Step 4: Display AI classification and worker matching.
      setAiResult({
        priority: aiData.analysis.priority,
        category: aiData.analysis.category,
        reason: aiData.analysis.reason,
        confidence: aiData.analysis.confidence,
        matchScore: aiData.matching?.match_score,
        matchReason: aiData.matching?.match_reason,
      });

      setSelectedService("");
      setSelectedArea("");
      setPreferredDate("");
      setPreferredTime("");
      setDescription("");

      setSuccess(
        "Request submitted. AI has analyzed the request and our matching engine has selected the most suitable available worker.",
      );

      await loadData();
    } catch (err) {
      console.error("Failed to create/analyze service request:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit service request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section-block">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
            Service Marketplace
          </div>

          <h2 className="text-2xl font-semibold text-white md:text-3xl">
            Request a Service
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            Tell us what you need and where you need it. Our AI analyzes the
            request before the matching engine selects an available worker.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-sm text-white/45">Active Requests</div>
            <div className="mt-2 text-3xl font-semibold text-white">
              {activeRequests.length}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-sm text-white/45">Completed</div>
            <div className="mt-2 text-3xl font-semibold text-emerald-300">
              {completedRequests.length}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-sm text-white/45">Total Requests</div>
            <div className="mt-2 text-3xl font-semibold text-cyan-300">
              {requests.length}
            </div>
          </div>
        </div>

        <div className="mb-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">
              Create New Request
            </h3>

            <p className="mt-1 text-sm text-white/45">
              Fill in the details below. AI will determine urgency and category
              before the worker matching engine runs.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
              {success}
            </div>
          )}

          {aiResult && (
            <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-lg">🤖</span>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                    AI Service Analysis
                  </div>

                  <div className="text-sm text-white/50">
                    Real-time priority classification
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-white/35">Priority</div>

                  <div
                    className={`mt-1 text-xl font-bold ${
                      aiResult.priority === "HIGH"
                        ? "text-red-300"
                        : aiResult.priority === "MEDIUM"
                          ? "text-amber-300"
                          : "text-emerald-300"
                    }`}
                  >
                    {aiResult.priority}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-white/35">AI Category</div>

                  <div className="mt-1 text-sm font-semibold text-white">
                    {aiResult.category}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-white/35">Confidence</div>

                  <div className="mt-1 text-xl font-bold text-cyan-300">
                    {Math.round(aiResult.confidence)}%
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-white/35">AI Reason</div>

                <p className="mt-1 text-sm leading-6 text-white/70">
                  {aiResult.reason}
                </p>
              </div>

              {aiResult.matchScore !== undefined && (
                <div className="mt-3 rounded-xl border border-purple-400/20 bg-purple-400/[0.05] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.15em] text-purple-300/70">
                    Explainable Worker Matching
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-white">
                      Match Score: {aiResult.matchScore}
                    </span>

                    <span className="text-xs text-white/40">
                      Skills + area + availability + workload + performance
                    </span>
                  </div>

                  {aiResult.matchReason && (
                    <p className="mt-2 text-sm text-white/60">
                      {aiResult.matchReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="service"
                  className="mb-2 block text-sm font-medium text-white/80"
                >
                  Service
                </label>

                <select
                  id="service"
                  value={selectedService}
                  onChange={(event) => setSelectedService(event.target.value)}
                  disabled={loading || submitting}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a service</option>

                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {getServiceIcon(service.name)} {service.name}
                    </option>
                  ))}
                </select>

                {selectedService && (
                  <p className="mt-2 text-xs text-white/40">
                    {
                      services.find(
                        (service) => service.id === selectedService,
                      )?.description
                    }
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="service-area"
                  className="mb-2 block text-sm font-medium text-white/80"
                >
                  Service Area / PIN Code
                </label>

                <select
                  id="service-area"
                  value={selectedArea}
                  onChange={(event) => setSelectedArea(event.target.value)}
                  disabled={loading || submitting}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select your area</option>

                  {serviceAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.pincode}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="preferred-date"
                  className="mb-2 block text-sm font-medium text-white/80"
                >
                  Preferred Date
                </label>

                <input
                  id="preferred-date"
                  type="date"
                  value={preferredDate}
                  onChange={(event) => setPreferredDate(event.target.value)}
                  disabled={submitting}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="preferred-time"
                  className="mb-2 block text-sm font-medium text-white/80"
                >
                  Preferred Time
                </label>

                <input
                  id="preferred-time"
                  type="time"
                  value={preferredTime}
                  onChange={(event) => setPreferredTime(event.target.value)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Describe What You Need
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={submitting}
                rows={5}
                placeholder="Example: There is a spark coming from the main switchboard and electricity keeps going off."
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || loading}
                className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-6 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "AI Analyzing..." : "Request Service"}
              </button>
            </div>
          </form>
        </div>

        <div>
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                Tracking
              </div>

              <h3 className="mt-2 text-2xl font-semibold text-white">
                Request History
              </h3>

              <p className="mt-1 text-sm text-white/45">
                Track the progress of every service request.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.06] disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-white/45">
              Loading your service requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
              <div className="text-4xl">🛠️</div>

              <h4 className="mt-4 text-lg font-semibold text-white">
                No service requests yet
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
                Create your first service request using the form above. Your
                requests will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const status = statusConfig[request.status];

                return (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/15"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xl">
                          {getServiceIcon(request.title)}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-white">
                              {request.title}
                            </h4>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                            <span>
                              Area:{" "}
                              {serviceAreas.find(
                                (area) =>
                                  area.id === request.serviceAreaId,
                              )?.pincode ?? request.serviceAreaId}
                            </span>

                            <span>
                              Preferred:{" "}
                              {formatDate(request.preferredDate)}
                            </span>

                            {request.preferredTime && (
                              <span>Time: {request.preferredTime}</span>
                            )}
                          </div>

                          {request.description && (
                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/50">
                              {request.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedRequest(request)}
                        className="shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                      >
                        View Details
                      </button>
                    </div>

                    <div className="mt-5 border-t border-white/5 pt-4 text-xs text-white/30">
                      Request created {formatDateTime(request.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#111318] p-6 shadow-2xl md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                  Service Request
                </div>

                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {selectedRequest.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-6">
              <span
                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${
                  statusConfig[selectedRequest.status].className
                }`}
              >
                {statusConfig[selectedRequest.status].label}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="text-xs text-white/35">Preferred Date</div>

                <div className="mt-1 text-sm text-white/80">
                  {formatDate(selectedRequest.preferredDate)}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="text-xs text-white/35">Preferred Time</div>

                <div className="mt-1 text-sm text-white/80">
                  {selectedRequest.preferredTime || "Not specified"}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="text-xs text-white/35">Service Area</div>

                <div className="mt-1 text-sm text-white/80">
                  {serviceAreas.find(
                    (area) => area.id === selectedRequest.serviceAreaId,
                  )?.pincode ?? selectedRequest.serviceAreaId}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="text-xs text-white/35">Assigned Worker</div>

                <div className="mt-1 text-sm text-white/80">
                  {selectedRequest.assignedWorkerId
                    ? "Worker assigned"
                    : "Waiting for worker"}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="text-xs text-white/35">Description</div>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/65">
                {selectedRequest.description || "No description provided."}
              </p>
            </div>

            <div className="mt-6 border-t border-white/5 pt-5 text-xs text-white/30">
              Created {formatDateTime(selectedRequest.createdAt)}
              <br />
              Last updated {formatDateTime(selectedRequest.updatedAt)}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white"
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

export default function CustomerPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      try {
        const [loadedTools, loadedReservations] = await Promise.all([
          getTools(),
          getReservations(),
        ]);

        if (!mounted) return;

        setTools(loadedTools);
        setReservations(loadedReservations);
      } catch (error) {
        console.error("Failed to load customer dashboard data:", error);

        if (mounted) {
          setTools([]);
          setReservations([]);
        }
      }
    };

    void loadDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <AppNav />

      <main>
        <RoleDashboard
          role="customer"
          tools={tools}
          reservations={reservations}
        />

        <CustomerServiceRequests />

        <ToolLibrary tools={tools} />

        <ReservationBoard reservations={reservations} compact />
      </main>
    </>
  );
}