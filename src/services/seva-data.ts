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

type ReservationRow = {
  id: string;
  start_date: string;
  end_date: string;
  status: Reservation["status"];
  qr_code: string | null;
  tools?: { name: string } | { name: string }[] | null;
  customer?: { full_name: string } | { full_name: string }[] | null;
  worker?: { full_name: string } | { full_name: string }[] | null;
};

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
  status:
    | "pending"
    | "matching"
    | "assigned"
    | "accepted"
    | "in_progress"
    | "completed"
    | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export type CreateServiceRequestInput = {
  serviceId: string;
  serviceAreaId: string;
  title: string;
  description?: string;
  preferredDate?: string;
  preferredTime?: string;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

/* ---------------------------------------------------------
   TOOLS
--------------------------------------------------------- */

export async function getTools(): Promise<Tool[]> {
  if (!hasSupabaseConfig || !supabase) {
    return demoTools;
  }

  const { data, error } = await supabase
    .from("tools")
    .select("id,name,description,location,status,demand_score,tool_categories(name)")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return demoTools;
  }

  return (data as unknown as ToolRow[]).map((tool, index) => {
    const category = firstRelation(tool.tool_categories);

    return {
      id: tool.id,
      name: tool.name,
      category: category?.name ?? "General",
      description:
        tool.description ?? "Community tool ready for reservation.",
      location: tool.location ?? "Main hub",
      status: tool.status,
      demandScore: tool.demand_score ?? 50,
      imageStyle: demoTools[index % demoTools.length].imageStyle,
    };
  });
}

/* ---------------------------------------------------------
   RESERVATIONS
--------------------------------------------------------- */

export async function getReservations(): Promise<Reservation[]> {
  if (!hasSupabaseConfig || !supabase) {
    return demoReservations;
  }

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id,start_date,end_date,status,qr_code,tools(name),customer:customer_id(full_name),worker:worker_id(full_name)",
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return demoReservations;
  }

  return (data as unknown as ReservationRow[]).map((reservation) => {
    const tool = firstRelation(reservation.tools);
    const customer = firstRelation(reservation.customer);
    const worker = firstRelation(reservation.worker);

    return {
      id: reservation.id,
      toolName: tool?.name ?? "Reserved tool",
      customerName: customer?.full_name ?? "Customer",
      workerName: worker?.full_name ?? "Pending assignment",
      startDate: reservation.start_date,
      endDate: reservation.end_date,
      status: reservation.status,
      qrCode:
        reservation.qr_code ??
        `SEVA-${reservation.id.slice(0, 8)}`,
    };
  });
}

/* ---------------------------------------------------------
   CREATE SERVICE REQUEST
--------------------------------------------------------- */

export async function createServiceRequest(
  input: CreateServiceRequestInput,
): Promise<{
  success: boolean;
  request?: ServiceRequest;
  error?: string;
}> {
  if (!hasSupabaseConfig || !supabase) {
    return {
      success: false,
      error: "Supabase is not configured.",
    };
  }

  // Get the currently authenticated Supabase user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return {
      success: false,
      error: authError.message,
    };
  }

  if (!user) {
    return {
      success: false,
      error: "Please sign in before requesting a service.",
    };
  }

  // Insert the service request
  const { data, error } = await supabase
    .from("service_requests")
    .insert({
      customer_id: user.id,
      service_id: input.serviceId,
      service_area_id: input.serviceAreaId,
      title: input.title,
      description: input.description?.trim() || null,
      preferred_date: input.preferredDate || null,
      preferred_time: input.preferredTime || null,
      status: "pending",
    })
    .select(
      "id,customer_id,service_id,service_area_id,assigned_worker_id,title,description,preferred_date,preferred_time,status,created_at,updated_at",
    )
    .single();

  if (error) {
    console.error("Error creating service request:", error);

    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    request: {
      id: data.id,
      customerId: data.customer_id,
      serviceId: data.service_id,
      serviceAreaId: data.service_area_id,
      assignedWorkerId: data.assigned_worker_id,
      title: data.title,
      description: data.description,
      preferredDate: data.preferred_date,
      preferredTime: data.preferred_time,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

/* ---------------------------------------------------------
   GET CURRENT CUSTOMER'S SERVICE REQUESTS
--------------------------------------------------------- */

export async function getMyServiceRequests(): Promise<ServiceRequest[]> {
  if (!hasSupabaseConfig || !supabase) {
    return [];
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("service_requests")
    .select(
      "id,customer_id,service_id,service_area_id,assigned_worker_id,title,description,preferred_date,preferred_time,status,created_at,updated_at",
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error loading service requests:", error);
    return [];
  }

  return data.map((request) => ({
    id: request.id,
    customerId: request.customer_id,
    serviceId: request.service_id,
    serviceAreaId: request.service_area_id,
    assignedWorkerId: request.assigned_worker_id,
    title: request.title,
    description: request.description,
    preferredDate: request.preferred_date,
    preferredTime: request.preferred_time,
    status: request.status,
    createdAt: request.created_at,
    updatedAt: request.updated_at,
  }));
}