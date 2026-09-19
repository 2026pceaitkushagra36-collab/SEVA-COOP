import type { DashboardMetric, Reservation, Tool, WorkflowStep } from "@/types/seva";

export const workflowSteps: WorkflowStep[] = [
  {
    id: 1,
    title: "Connect Supabase",
    status: "done",
    description: "Project keys are loaded through environment variables.",
  },
  {
    id: 2,
    title: "Create Database Schema",
    status: "active",
    description: "Profiles, tools, reservations, QR movement, reviews, and policies.",
  },
  {
    id: 3,
    title: "Connect Frontend to Backend",
    status: "queued",
    description: "Pages read from Supabase and gracefully fall back to demo data.",
  },
  {
    id: 4,
    title: "Authentication",
    status: "queued",
    description: "Role-aware login for customers, workers, and admins.",
  },
  {
    id: 5,
    title: "Customer Dashboard",
    status: "queued",
    description: "Browse tools, view bookings, and see pickup readiness.",
  },
  {
    id: 6,
    title: "Worker Dashboard",
    status: "queued",
    description: "Approve requests and verify pickup or return events.",
  },
  {
    id: 7,
    title: "Tool Library",
    status: "queued",
    description: "Categorized inventory with availability and demand signals.",
  },
  {
    id: 8,
    title: "Tool Reservation",
    status: "queued",
    description: "Customer requests with date windows and status tracking.",
  },
  {
    id: 9,
    title: "QR Pickup / Return",
    status: "queued",
    description: "Reservation-linked QR codes for handover verification.",
  },
  {
    id: 10,
    title: "Admin Dashboard",
    status: "queued",
    description: "Inventory, usage, role, and operational oversight.",
  },
  {
    id: 11,
    title: "AI Recommendations",
    status: "queued",
    description: "Suggest tools from job type, season, and local demand.",
  },
  {
    id: 12,
    title: "Testing + Polish",
    status: "queued",
    description: "Build checks, mobile polish, and workflow QA.",
  },
  {
    id: 13,
    title: "Deploy",
    status: "queued",
    description: "Ship the app once Supabase policies and env vars are ready.",
  },
];

export const demoTools: Tool[] = [
  {
    id: "rotavator",
    name: "Power Rotavator",
    category: "Farming",
    description: "Soil preparation tool for small farm plots and cooperative use.",
    location: "Village Hub A",
    status: "available",
    demandScore: 92,
    imageStyle: "from-emerald-500 to-lime-300",
  },
  {
    id: "drill",
    name: "Hammer Drill Kit",
    category: "Construction",
    description: "Concrete drilling kit with bits, case, and safety checklist.",
    location: "Service Kendra",
    status: "reserved",
    demandScore: 74,
    imageStyle: "from-sky-500 to-cyan-300",
  },
  {
    id: "sprayer",
    name: "Battery Sprayer",
    category: "Farming",
    description: "Rechargeable crop sprayer with nozzle set and tank harness.",
    location: "Village Hub B",
    status: "available",
    demandScore: 88,
    imageStyle: "from-amber-400 to-green-400",
  },
  {
    id: "cutter",
    name: "Tile Cutter",
    category: "Repair",
    description: "Manual tile cutter for home repair and local contractor jobs.",
    location: "Ward Store",
    status: "maintenance",
    demandScore: 61,
    imageStyle: "from-rose-400 to-orange-300",
  },
];

export const demoReservations: Reservation[] = [
  {
    id: "RSV-1024",
    toolName: "Hammer Drill Kit",
    customerName: "Asha Kumar",
    workerName: "Ravi S.",
    startDate: "2026-09-18",
    endDate: "2026-09-20",
    status: "approved",
    qrCode: "SEVA-RSV-1024",
  },
  {
    id: "RSV-1025",
    toolName: "Battery Sprayer",
    customerName: "Meena Farms",
    workerName: "Pending assignment",
    startDate: "2026-09-21",
    endDate: "2026-09-22",
    status: "pending",
    qrCode: "SEVA-RSV-1025",
  },
  {
    id: "RSV-1026",
    toolName: "Power Rotavator",
    customerName: "Kiran Patel",
    workerName: "Neha P.",
    startDate: "2026-09-14",
    endDate: "2026-09-16",
    status: "returned",
    qrCode: "SEVA-RSV-1026",
  },
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Tools ready", value: "24", detail: "Across 4 local hubs" },
  { label: "Active bookings", value: "8", detail: "3 pickups due today" },
  { label: "Return rate", value: "97%", detail: "On-time this month" },
  { label: "AI matches", value: "18", detail: "Recommended this week" },
];

export const aiRecommendations = [
  "Battery sprayer demand is rising for crop care this week.",
  "Keep one hammer drill at Service Kendra for weekend repair requests.",
  "Move Power Rotavator to Village Hub B before the next soil prep window.",
];
