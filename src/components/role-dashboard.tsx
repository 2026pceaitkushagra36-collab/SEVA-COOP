import { aiRecommendations, dashboardMetrics } from "@/config/workflow";
import type { Reservation, Tool, UserRole } from "@/types/seva";

type RoleDashboardProps = {
  role: UserRole;
  tools: Tool[];
  reservations: Reservation[];
};

const roleCopy: Record<UserRole, { title: string; summary: string; focus: string[] }> = {
  customer: {
    title: "Customer Dashboard",
    summary: "Find tools, reserve time slots, and track pickup readiness.",
    focus: ["Browse nearby availability", "Book with dates", "Show QR at pickup"],
  },
  worker: {
    title: "Worker Dashboard",
    summary: "Approve requests, manage handovers, and keep tools moving.",
    focus: ["Review pending requests", "Verify QR pickup", "Close returns"],
  },
  admin: {
    title: "Admin Dashboard",
    summary: "Monitor inventory health, usage, roles, and demand signals.",
    focus: ["Track hub inventory", "Audit reservations", "Plan AI-led restocking"],
  },
};

export function RoleDashboard({ role, tools, reservations }: RoleDashboardProps) {
  const copy = roleCopy[role];
  const availableTools = tools.filter((tool) => tool.status === "available").length;
  const activeReservations = reservations.filter(
    (reservation) => reservation.status !== "returned" && reservation.status !== "cancelled",
  ).length;

  return (
    <section className="dashboard-shell">
      <div className="dashboard-intro">
        <p className="eyebrow">{copy.title}</p>
        <h1>{copy.summary}</h1>
        <div className="focus-list">
          {copy.focus.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      <div className="metric-grid">
        {dashboardMetrics.map((metric) => (
          <div className="metric-card" key={metric.label}>
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
            <span>{metric.detail}</span>
          </div>
        ))}
      </div>

      <div className="ops-grid">
        <article className="ops-panel">
          <h2>Today&apos;s Snapshot</h2>
          <div className="snapshot-line">
            <span>Available tools</span>
            <strong>{availableTools}</strong>
          </div>
          <div className="snapshot-line">
            <span>Active reservations</span>
            <strong>{activeReservations}</strong>
          </div>
          <div className="snapshot-line">
            <span>Next action</span>
            <strong>{role === "customer" ? "Reserve" : role === "worker" ? "Verify" : "Audit"}</strong>
          </div>
        </article>

        <article className="ops-panel">
          <h2>AI Recommendations</h2>
          <ul className="recommendation-list">
            {aiRecommendations.map((recommendation) => (
              <li key={recommendation}>{recommendation}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
