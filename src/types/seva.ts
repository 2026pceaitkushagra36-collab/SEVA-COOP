export type UserRole = "customer" | "worker" | "admin";

export type ToolStatus = "available" | "reserved" | "picked_up" | "maintenance";

export type ReservationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "picked_up"
  | "returned"
  | "cancelled";

export type Tool = {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  status: ToolStatus;
  demandScore: number;
  imageStyle: string;
};

export type Reservation = {
  id: string;
  toolName: string;
  customerName: string;
  workerName: string;
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  qrCode: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

export type WorkflowStep = {
  id: number;
  title: string;
  status: "done" | "active" | "queued";
  description: string;
};
