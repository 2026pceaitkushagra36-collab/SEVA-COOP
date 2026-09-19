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

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

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
      description: tool.description ?? "Community tool ready for reservation.",
      location: tool.location ?? "Main hub",
      status: tool.status,
      demandScore: tool.demand_score ?? 50,
      imageStyle: demoTools[index % demoTools.length].imageStyle,
    };
  });
}

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
      qrCode: reservation.qr_code ?? `SEVA-${reservation.id.slice(0, 8)}`,
    };
  });
}
