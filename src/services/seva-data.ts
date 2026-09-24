import { demoReservations, demoTools } from "@/config/workflow";
import { hasSupabaseConfig, supabase } from "@/lib/supabase/client";
import type { Reservation, Tool } from "@/types/seva";

type ToolRow = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: Tool["status"];
  demand_score: number | null;
  tool_categories?: { name: string } | { name: string }[] | null;
};

export type ServiceRequestStatus =
  | "pending"
  | "matching"
  | "assigned"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ServiceRequestPriority = "HIGH" | "MEDIUM" | "LOW";

export type ServiceRequest = {
  id: string;
  customerId: string;
  serviceId: string;
  serviceAreaId: string;
  assignedWorkerId: string | null;
  title: string;
  description: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  status: ServiceRequestStatus;

  priority: ServiceRequestPriority | null;
  aiCategory: string | null;
  aiReason: string | null;
  aiConfidence: number | null;
  aiProcessedAt: string | null;

  matchScore: number | null;
  matchReason: string | null;
  matchedAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type CreateServiceRequestInput = {
  serviceId: string;
  serviceAreaId: string;
  title: string;
  description?: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
};

type ServiceRequestRow = {
  id: string;
  customer_id: string;
  service_id: string;
  service_area_id: string;
  assigned_worker_id: string | null;
  title: string;
  description: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: ServiceRequestStatus;

  priority: ServiceRequestPriority | null;
  ai_category: string | null;
  ai_reason: string | null;
  ai_confidence: number | null;
  ai_processed_at: string | null;

  match_score: number | null;
  match_reason: string | null;
  matched_at: string | null;

  created_at: string;
  updated_at: string;
};

function firstRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

function mapServiceRequest(
  row: ServiceRequestRow,
): ServiceRequest {
  return {
    id: row.id,
    customerId: row.customer_id,
    serviceId: row.service_id,
    serviceAreaId: row.service_area_id,
    assignedWorkerId: row.assigned_worker_id,
    title: row.title,
    description: row.description,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    status: row.status,

    priority: row.priority,
    aiCategory: row.ai_category,
    aiReason: row.ai_reason,
    aiConfidence: row.ai_confidence,
    aiProcessedAt: row.ai_processed_at,

    matchScore: row.match_score,
    matchReason: row.match_reason,
    matchedAt: row.matched_at,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* =========================================================
   TOOLS
   ========================================================= */

export async function getTools(): Promise<Tool[]> {
  if (!supabase || !hasSupabaseConfig) {
    return demoTools;
  }

  try {
    const { data, error } = await supabase
      .from("tools")
      .select(
        `
          id,
          name,
          description,
          location,
          status,
          demand_score,
          tool_categories(name)
        `,
      )
      .order("name", { ascending: true });

    if (error) {
      console.warn(
        "Failed to load tools from Supabase:",
        error.message,
      );

      return demoTools;
    }

    return ((data ?? []) as ToolRow[]).map((row) => {
      const category = firstRelation(row.tool_categories);

      return {
        id: row.id,
        name: row.name,
        description: row.description ?? "",
        location: row.location ?? "",
        status: row.status,
        demandScore: row.demand_score ?? 0,
        category: category?.name ?? "General",
      } as Tool;
    });
  } catch (error) {
    console.warn(
      "Failed to load tools:",
      error,
    );

    return demoTools;
  }
}

/* =========================================================
   TOOL RESERVATIONS
   ---------------------------------------------------------
   The Supabase project currently does not contain the
   tool_reservations table.

   Keep reservations demo-backed so this optional feature
   does not break the main service-request workflow.
   ========================================================= */

export async function getReservations(): Promise<Reservation[]> {
  return demoReservations;
}

/* =========================================================
   SERVICE REQUESTS
   ========================================================= */

const SERVICE_REQUEST_SELECT = `
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
  priority,
  ai_category,
  ai_reason,
  ai_confidence,
  ai_processed_at,
  match_score,
  match_reason,
  matched_at,
  created_at,
  updated_at
`;

/* =========================================================
   CREATE SERVICE REQUEST
   ========================================================= */

export async function createServiceRequest(
  input: CreateServiceRequestInput,
): Promise<{
  success: boolean;
  request?: ServiceRequest;
  error?: string;
}> {
  try {
    if (!supabase || !hasSupabaseConfig) {
      return {
        success: false,
        error: "Supabase is not configured.",
      };
    }

    console.log("=== SEVA-COOP CREATE REQUEST START ===");
    console.log("Input:", input);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log("Session:", {
      exists: Boolean(session),
      userId: session?.user?.id ?? null,
    });

    if (sessionError) {
      console.error("SESSION ERROR:", sessionError);

      return {
        success: false,
        error: `Session error: ${sessionError.message}`,
      };
    }

    if (!session?.user) {
      return {
        success: false,
        error:
          "No authenticated user found. Please log in again.",
      };
    }

    const userId = session.user.id;

    if (!input.serviceId) {
      return {
        success: false,
        error: "Service ID is missing.",
      };
    }

    if (!input.serviceAreaId) {
      return {
        success: false,
        error: "Service area ID is missing.",
      };
    }

    if (!input.title?.trim()) {
      return {
        success: false,
        error: "Service request title is missing.",
      };
    }

    const requestId = crypto.randomUUID();

    const insertData = {
      id: requestId,
      customer_id: userId,
      service_id: input.serviceId,
      service_area_id: input.serviceAreaId,
      assigned_worker_id: null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      preferred_date: input.preferredDate || null,
      preferred_time: input.preferredTime || null,
      status: "pending",
    };

    console.log("INSERT DATA:", insertData);

    const { data, error } = await supabase
      .from("service_requests")
      .insert(insertData)
      .select(SERVICE_REQUEST_SELECT)
      .single();

    if (error) {
      console.error(
        "========== SUPABASE INSERT ERROR ==========",
      );
      console.error("message:", error.message);
      console.error("code:", error.code);
      console.error("details:", error.details);
      console.error("hint:", error.hint);
      console.error("full error:", error);
      console.error(
        "============================================",
      );

      return {
        success: false,
        error: [
          error.message,
          error.code ? `Code: ${error.code}` : "",
          error.details ? `Details: ${error.details}` : "",
          error.hint ? `Hint: ${error.hint}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
      };
    }

    console.log(
      "SUPABASE INSERT SUCCESS:",
      data,
    );

    if (!data) {
      return {
        success: false,
        error:
          "Request was inserted but Supabase returned no request data.",
      };
    }

    return {
      success: true,
      request: mapServiceRequest(
        data as ServiceRequestRow,
      ),
    };
  } catch (error) {
    console.error(
      "========== CREATE REQUEST EXCEPTION ==========",
    );
    console.error(error);
    console.error(
      "===============================================",
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : JSON.stringify(error),
    };
  }
}

/* =========================================================
   CUSTOMER REQUEST HISTORY
   ========================================================= */

export async function getMyServiceRequests(): Promise<
  ServiceRequest[]
> {
  try {
    if (!supabase || !hasSupabaseConfig) {
      console.error(
        "Supabase is not configured.",
      );

      return [];
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(
        "SESSION ERROR:",
        sessionError.message,
      );

      return [];
    }

    if (!session?.user) {
      console.error(
        "No authenticated user found.",
      );

      return [];
    }

    const { data, error } = await supabase
      .from("service_requests")
      .select(SERVICE_REQUEST_SELECT)
      .eq("customer_id", session.user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "GET SERVICE REQUESTS ERROR:",
        error.message,
        error.code,
        error.details,
        error.hint,
      );

      return [];
    }

    return (data ?? []).map((row) =>
      mapServiceRequest(
        row as ServiceRequestRow,
      ),
    );
  } catch (error) {
    console.error(
      "GET MY SERVICE REQUESTS EXCEPTION:",
      error,
    );

    return [];
  }
}

/* =========================================================
   SINGLE SERVICE REQUEST
   ========================================================= */

export async function getServiceRequest(
  requestId: string,
): Promise<ServiceRequest | null> {
  if (!supabase || !hasSupabaseConfig) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("service_requests")
      .select(SERVICE_REQUEST_SELECT)
      .eq("id", requestId)
      .maybeSingle();

    if (error) {
      console.error(
        "GET SERVICE REQUEST ERROR:",
        error.message,
      );

      return null;
    }

    return data
      ? mapServiceRequest(
          data as ServiceRequestRow,
        )
      : null;
  } catch (error) {
    console.error(
      "GET SERVICE REQUEST EXCEPTION:",
      error,
    );

    return null;
  }
}

/* =========================================================
   WORKER REQUESTS
   ========================================================= */

export async function getWorkerServiceRequests(): Promise<
  ServiceRequest[]
> {
  if (!supabase || !hasSupabaseConfig) {
    return [];
  }

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.error(
        "Worker session unavailable:",
        sessionError?.message,
      );

      return [];
    }

    const userId = session.user.id;

    const { data, error } = await supabase
      .from("service_requests")
      .select(SERVICE_REQUEST_SELECT)
      .or(
        `assigned_worker_id.is.null,assigned_worker_id.eq.${userId}`,
      )
      .in("status", [
        "pending",
        "matching",
        "assigned",
        "accepted",
        "in_progress",
      ])
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "GET WORKER SERVICE REQUESTS ERROR:",
        error.message,
        error.code,
        error.details,
        error.hint,
      );

      return [];
    }

    return (data ?? []).map((row) =>
      mapServiceRequest(
        row as ServiceRequestRow,
      ),
    );
  } catch (error) {
    console.error(
      "GET WORKER SERVICE REQUESTS EXCEPTION:",
      error,
    );

    return [];
  }
}

/* =========================================================
   ACCEPT SERVICE REQUEST
   ========================================================= */

export async function acceptServiceRequest(
  requestId: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!supabase || !hasSupabaseConfig) {
    return {
      success: false,
      error: "Supabase is not configured.",
    };
  }

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return {
        success: false,
        error:
          sessionError?.message ||
          "Worker session is unavailable.",
      };
    }

    const userId = session.user.id;

    /*
     * First accept a request that was already assigned
     * to this worker.
     */
    const {
      data: assigned,
      error: assignedError,
    } = await supabase
      .from("service_requests")
      .update({
        status: "accepted",
      })
      .eq("id", requestId)
      .eq("assigned_worker_id", userId)
      .eq("status", "assigned")
      .select("id")
      .maybeSingle();

    if (assignedError) {
      return {
        success: false,
        error: assignedError.message,
      };
    }

    if (assigned) {
      return {
        success: true,
      };
    }

    /*
     * Otherwise allow the worker to claim an
     * unassigned pending/matching request.
     */
    const {
      data: claimed,
      error: claimError,
    } = await supabase
      .from("service_requests")
      .update({
        assigned_worker_id: userId,
        status: "accepted",
      })
      .eq("id", requestId)
      .is("assigned_worker_id", null)
      .in("status", [
        "pending",
        "matching",
      ])
      .select("id")
      .maybeSingle();

    if (claimError) {
      return {
        success: false,
        error: claimError.message,
      };
    }

    if (!claimed) {
      return {
        success: false,
        error:
          "This service request is no longer available.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to accept service request.",
    };
  }
}

/* =========================================================
   REJECT SERVICE REQUEST
   ========================================================= */

export async function rejectServiceRequest(
  requestId: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!supabase || !hasSupabaseConfig) {
    return {
      success: false,
      error: "Supabase is not configured.",
    };
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return {
        success: false,
        error:
          "Worker session is unavailable.",
      };
    }

    const { error } = await supabase
      .from("service_requests")
      .update({
        assigned_worker_id: null,
        status: "matching",
      })
      .eq("id", requestId)
      .eq(
        "assigned_worker_id",
        session.user.id,
      );

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to reject service request.",
    };
  }
}

/* =========================================================
   START SERVICE REQUEST
   ========================================================= */

export async function startServiceRequest(
  requestId: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!supabase || !hasSupabaseConfig) {
    return {
      success: false,
      error: "Supabase is not configured.",
    };
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return {
        success: false,
        error:
          "Worker session is unavailable.",
      };
    }

    const { error } = await supabase
      .from("service_requests")
      .update({
        status: "in_progress",
      })
      .eq("id", requestId)
      .eq(
        "assigned_worker_id",
        session.user.id,
      )
      .in("status", [
        "assigned",
        "accepted",
      ]);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to start service request.",
    };
  }
}

/* =========================================================
   COMPLETE SERVICE REQUEST
   ========================================================= */

export async function completeServiceRequest(
  requestId: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!supabase || !hasSupabaseConfig) {
    return {
      success: false,
      error: "Supabase is not configured.",
    };
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return {
        success: false,
        error:
          "Worker session is unavailable.",
      };
    }

    const { error } = await supabase
      .from("service_requests")
      .update({
        status: "completed",
      })
      .eq("id", requestId)
      .eq(
        "assigned_worker_id",
        session.user.id,
      )
      .eq("status", "in_progress");

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to complete service request.",
    };
  }
}