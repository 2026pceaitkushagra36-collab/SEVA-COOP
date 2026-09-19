"use client";

import { useMemo, useState } from "react";
import { aiRecommendations, dashboardMetrics } from "@/config/workflow";
import type { Reservation, Tool, UserRole } from "@/types/seva";

type RoleDashboardProps = {
  role: UserRole;
  tools: Tool[];
  reservations: Reservation[];
};

const roleCopy: Record<
  UserRole,
  {
    title: string;
    heading: string;
    description: string;
    action: string;
    icon: string;
  }
> = {
  customer: {
    title: "CUSTOMER DASHBOARD",
    heading: "Your community services,",
    description:
      "Discover available tools, manage reservations and keep track of your community activity.",
    action: "Find a Tool",
    icon: "✦",
  },
  worker: {
    title: "WORKER DASHBOARD",
    heading: "Keep your community moving.",
    description:
      "Review requests, manage handovers and keep tools available for the people who need them.",
    action: "Review Requests",
    icon: "⚙",
  },
  admin: {
    title: "ADMIN DASHBOARD",
    heading: "Your community, under control.",
    description:
      "Monitor inventory, reservations, activity and demand across your SEVA-COOP network.",
    action: "View Analytics",
    icon: "◈",
  },
};

export function RoleDashboard({
  role,
  tools,
  reservations,
}: RoleDashboardProps) {
  const copy = roleCopy[role];

  const [activeTab, setActiveTab] = useState<
    "overview" | "reservations" | "tools"
  >("overview");

  const [showAI, setShowAI] = useState(true);

  const availableTools = tools.filter(
    (tool) => tool.status === "available",
  ).length;

  const activeReservations = reservations.filter(
    (reservation) =>
      reservation.status !== "returned" &&
      reservation.status !== "cancelled",
  ).length;

  const pendingReservations = reservations.filter(
    (reservation) => String(reservation.status) === "pending",
  ).length;

  const completedReservations = reservations.filter(
    (reservation) => String(reservation.status) === "returned",
  ).length;

  const cancelledReservations = reservations.filter(
    (reservation) => String(reservation.status) === "cancelled",
  ).length;

  const totalTools = tools.length;

  const availability =
    totalTools > 0
      ? Math.round((availableTools / totalTools) * 100)
      : 0;

  const completionRate =
    reservations.length > 0
      ? Math.round(
          (completedReservations / reservations.length) * 100,
        )
      : 0;

  const recentReservations = reservations.slice(0, 4);
  const recentTools = tools.slice(0, 4);

  const activity = useMemo(() => {
    const items = [];

    if (availableTools > 0) {
      items.push({
        icon: "✓",
        title: `${availableTools} tools available`,
        text: "Ready for community use",
        type: "success",
      });
    }

    if (pendingReservations > 0) {
      items.push({
        icon: "!",
        title: `${pendingReservations} pending request${
          pendingReservations === 1 ? "" : "s"
        }`,
        text: "Waiting for action",
        type: "warning",
      });
    }

    if (completedReservations > 0) {
      items.push({
        icon: "✓",
        title: `${completedReservations} completed`,
        text: "Successfully closed reservations",
        type: "success",
      });
    }

    if (cancelledReservations > 0) {
      items.push({
        icon: "×",
        title: `${cancelledReservations} cancelled`,
        text: "Reservations closed",
        type: "danger",
      });
    }

    if (items.length === 0) {
      items.push({
        icon: "•",
        title: "Everything is ready",
        text: "No activity requires attention",
        type: "info",
      });
    }

    return items.slice(0, 4);
  }, [
    availableTools,
    pendingReservations,
    completedReservations,
    cancelledReservations,
  ]);

  return (
    <section className="seva-dashboard">
      {/* HERO */}
      <div className="seva-dashboard-hero">
        <div className="seva-dashboard-hero-content">
          <div className="seva-dashboard-eyebrow">
            <span className="seva-live-dot" />
            {copy.title}
          </div>

          <h1>
            {copy.heading}
            <span> all in one place.</span>
          </h1>

          <p>{copy.description}</p>

          <div className="seva-dashboard-pills">
            <span>● Community Connected</span>
            <span>● Services Active</span>
            <span>● Secure Access</span>
          </div>
        </div>

        <div className="seva-dashboard-hero-card">
          <div className="seva-card-glow" />

          <div className="seva-dashboard-card-top">
            <span>SERVICE AREA</span>
            <div className="seva-pin-icon">📍</div>
          </div>

          <h2>Your Dashboard</h2>

          <p>
            Manage your SEVA-COOP activity and discover what is available
            in your community.
          </p>

          <button
            type="button"
            onClick={() => setActiveTab("tools")}
          >
            {copy.action} →
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="seva-dashboard-tabs">
        <button
          type="button"
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>

        <button
          type="button"
          className={activeTab === "reservations" ? "active" : ""}
          onClick={() => setActiveTab("reservations")}
        >
          Reservations
          {activeReservations > 0 && (
            <span>{activeReservations}</span>
          )}
        </button>

        <button
          type="button"
          className={activeTab === "tools" ? "active" : ""}
          onClick={() => setActiveTab("tools")}
        >
          Tools
          <span>{availableTools}</span>
        </button>
      </div>

      {/* METRICS */}
      <div className="seva-metric-grid">
        {dashboardMetrics.map((metric, index) => {
          let value = metric.value;

          if (index === 0) {
            value = availableTools;
          }

          if (index === 1) {
            value = activeReservations;
          }

          return (
            <button
              type="button"
              key={metric.label}
              className="seva-metric-card"
              onClick={() => {
                if (index === 0) {
                  setActiveTab("tools");
                } else {
                  setActiveTab("reservations");
                }
              }}
            >
              <div className="seva-metric-header">
                <p>{metric.label}</p>
                <span className="seva-metric-icon">
                  {index === 0
                    ? "◈"
                    : index === 1
                      ? "↗"
                      : index === 2
                        ? "✓"
                        : "⌁"}
                </span>
              </div>

              <strong>{value}</strong>

              <span className="seva-metric-detail">
                {metric.detail}
              </span>

              <div className="seva-metric-line">
                <span
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(12, Number(value) || 20),
                    )}%`,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <>
          <div className="seva-content-grid">
            {/* SNAPSHOT */}
            <article className="seva-panel seva-snapshot-panel">
              <div className="seva-panel-heading">
                <div>
                  <span>LIVE OVERVIEW</span>
                  <h2>Today&apos;s Snapshot</h2>
                </div>

                <div className="seva-live-badge">
                  <span />
                  LIVE
                </div>
              </div>

              <div className="seva-snapshot-list">
                <div>
                  <span>Available tools</span>
                  <strong>{availableTools}</strong>
                </div>

                <div>
                  <span>Active reservations</span>
                  <strong>{activeReservations}</strong>
                </div>

                <div>
                  <span>Pending requests</span>
                  <strong>{pendingReservations}</strong>
                </div>

                <div>
                  <span>Next action</span>
                  <strong>
                    {role === "customer"
                      ? "Reserve"
                      : role === "worker"
                        ? "Verify"
                        : "Audit"}
                  </strong>
                </div>
              </div>

              <div className="seva-progress-section">
                <div>
                  <span>Tool availability</span>
                  <strong>{availability}%</strong>
                </div>

                <div className="seva-progress">
                  <span style={{ width: `${availability}%` }} />
                </div>
              </div>
            </article>

            {/* AI */}
            <article className="seva-panel seva-ai-panel">
              <div className="seva-panel-heading">
                <div>
                  <span>SMART ASSIST</span>
                  <h2>AI Recommendations</h2>
                </div>

                <button
                  type="button"
                  className="seva-collapse"
                  onClick={() => setShowAI(!showAI)}
                >
                  {showAI ? "−" : "+"}
                </button>
              </div>

              {showAI ? (
                <div className="seva-ai-list">
                  {aiRecommendations.map((recommendation, index) => (
                    <div
                      className="seva-ai-item"
                      key={recommendation}
                    >
                      <div className="seva-ai-number">
                        {index + 1}
                      </div>

                      <p>{recommendation}</p>

                      <span>→</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="seva-ai-hidden">
                  AI recommendations are hidden.
                </div>
              )}
            </article>
          </div>

          {/* ACTIVITY + HEALTH */}
          <div className="seva-content-grid">
            <article className="seva-panel">
              <div className="seva-panel-heading">
                <div>
                  <span>COMMUNITY ACTIVITY</span>
                  <h2>Recent Activity</h2>
                </div>
              </div>

              <div className="seva-activity-list">
                {activity.map((item, index) => (
                  <div
                    className="seva-activity-item"
                    key={`${item.title}-${index}`}
                  >
                    <div
                      className={`seva-activity-icon ${item.type}`}
                    >
                      {item.icon}
                    </div>

                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.text}</span>
                    </div>

                    <small>{index === 0 ? "Now" : "Today"}</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="seva-panel seva-health-panel">
              <div className="seva-panel-heading">
                <div>
                  <span>RESERVATION STATUS</span>
                  <h2>Community Health</h2>
                </div>
              </div>

              <div className="seva-health-content">
                <div
                  className="seva-health-circle"
                  style={{
                    background: `conic-gradient(
                      #8b3dff ${completionRate}%,
                      rgba(255,255,255,0.06) ${completionRate}% 100%
                    )`,
                  }}
                >
                  <div>
                    <strong>{completionRate}%</strong>
                    <span>complete</span>
                  </div>
                </div>

                <div className="seva-health-stats">
                  <div>
                    <strong>{completedReservations}</strong>
                    <span>Completed</span>
                  </div>

                  <div>
                    <strong>{pendingReservations}</strong>
                    <span>Pending</span>
                  </div>

                  <div>
                    <strong>{cancelledReservations}</strong>
                    <span>Cancelled</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </>
      )}

      {/* RESERVATIONS */}
      {activeTab === "reservations" && (
        <article className="seva-panel seva-expanded-panel">
          <div className="seva-panel-heading">
            <div>
              <span>BOOKING MANAGEMENT</span>
              <h2>Your Reservations</h2>
            </div>

            <div className="seva-count-badge">
              {reservations.length} total
            </div>
          </div>

          {recentReservations.length > 0 ? (
            <div className="seva-reservation-list">
              {recentReservations.map((reservation, index) => (
                <div
                  className="seva-reservation-item"
                  key={index}
                >
                  <div className="seva-reservation-number">
                    {index + 1}
                  </div>

                  <div className="seva-reservation-info">
                    <strong>
                      Reservation #{index + 1}
                    </strong>

                    <span>
                      Status:{" "}
                      {String(reservation.status)
                        .charAt(0)
                        .toUpperCase() +
                        String(reservation.status).slice(1)}
                    </span>
                  </div>

                  <div
                    className={`seva-status seva-status-${String(
                      reservation.status,
                    )}`}
                  >
                    {String(reservation.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="seva-empty-state">
              <div>◈</div>
              <h3>No reservations yet</h3>
              <p>
                Your community reservations will appear here.
              </p>
            </div>
          )}
        </article>
      )}

      {/* TOOLS */}
      {activeTab === "tools" && (
        <article className="seva-panel seva-expanded-panel">
          <div className="seva-panel-heading">
            <div>
              <span>COMMUNITY RESOURCES</span>
              <h2>Available Tools</h2>
            </div>

            <div className="seva-count-badge">
              {availableTools} available
            </div>
          </div>

          {recentTools.length > 0 ? (
            <div className="seva-tools-grid">
              {recentTools.map((tool, index) => (
                <div
                  className="seva-tool-card"
                  key={index}
                >
                  <div className="seva-tool-image">
                    {index % 3 === 0
                      ? "🔧"
                      : index % 3 === 1
                        ? "🛠️"
                        : "⚙️"}
                  </div>

                  <div>
                    <strong>
                      {"name" in tool
                        ? String(
                            (
                              tool as Tool & {
                                name?: string;
                              }
                            ).name ?? `Community Tool ${index + 1}`,
                          )
                        : `Community Tool ${index + 1}`}
                    </strong>

                    <span
                      className={
                        tool.status === "available"
                          ? "tool-available"
                          : "tool-unavailable"
                      }
                    >
                      ● {tool.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="seva-empty-state">
              <div>⚙</div>
              <h3>No tools available</h3>
              <p>
                New community resources will appear here.
              </p>
            </div>
          )}
        </article>
      )}

      {/* BOTTOM CTA */}
      <div className="seva-dashboard-cta">
        <div>
          <span>SEVA-COOP COMMUNITY HUB</span>
          <h2>Ready to make your next move?</h2>
          <p>
            Access services, manage resources and stay connected
            with your community.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab("tools")}
        >
          Explore Services →
        </button>
      </div>

      <style jsx>{`
        .seva-dashboard {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 28px 32px 70px;
          color: var(--foreground);
        }

        .seva-dashboard-hero {
          min-height: 360px;
          display: grid;
          grid-template-columns: 1.35fr 0.65fr;
          gap: 35px;
          padding: 48px;
          border-radius: 28px;
          overflow: hidden;
          position: relative;
          background:
            radial-gradient(
              circle at 80% 20%,
              rgba(112, 32, 255, 0.3),
              transparent 32%
            ),
            radial-gradient(
              circle at 10% 100%,
              rgba(0, 188, 255, 0.12),
              transparent 35%
            ),
            #09101f;
          border: 1px solid rgba(139, 61, 255, 0.16);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.22);
        }

        .seva-dashboard-hero-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .seva-dashboard-eyebrow {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 14px;
          margin-bottom: 20px;
          border-radius: 999px;
          background: rgba(113, 55, 255, 0.12);
          border: 1px solid rgba(139, 61, 255, 0.25);
          color: #a987ff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .seva-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #20d9ff;
          box-shadow: 0 0 12px rgba(32, 217, 255, 0.8);
        }

        .seva-dashboard-hero h1 {
          max-width: 650px;
          margin: 0 0 18px;
          font-size: clamp(38px, 5vw, 62px);
          line-height: 0.98;
          letter-spacing: -0.045em;
          font-weight: 900;
        }

        .seva-dashboard-hero h1 span {
          display: block;
          background: linear-gradient(
            90deg,
            #913aff,
            #b26aff,
            #31bfff
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .seva-dashboard-hero-content > p {
          max-width: 640px;
          margin: 0;
          color: #91a1bc;
          font-size: 15px;
          line-height: 1.7;
        }

        .seva-dashboard-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 25px;
        }

        .seva-dashboard-pills span {
          padding: 7px 11px;
          border-radius: 999px;
          color: #788aa8;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 10px;
        }

        .seva-dashboard-hero-card {
          align-self: center;
          padding: 27px;
          border-radius: 24px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(
            135deg,
            #7412f4,
            #5029b9
          );
          box-shadow: 0 25px 55px rgba(91, 27, 210, 0.3);
        }

        .seva-card-glow {
          position: absolute;
          width: 130px;
          height: 130px;
          right: -35px;
          top: -45px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.13);
          filter: blur(20px);
        }

        .seva-dashboard-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .seva-dashboard-card-top span {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .seva-pin-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.1);
          font-size: 18px;
        }

        .seva-dashboard-hero-card h2 {
          margin: 27px 0 9px;
          font-size: 27px;
        }

        .seva-dashboard-hero-card p {
          margin: 0;
          color: rgba(255, 255, 255, 0.75);
          font-size: 12px;
          line-height: 1.7;
        }

        .seva-dashboard-hero-card button {
          width: 100%;
          margin-top: 25px;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: white;
          color: #6815e9;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .seva-dashboard-hero-card button:hover {
          transform: translateY(-2px);
        }

        .seva-dashboard-tabs {
          display: flex;
          gap: 5px;
          margin: 22px 0;
          padding: 5px;
          width: fit-content;
          border-radius: 14px;
          background: #0c1424;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .seva-dashboard-tabs button {
          border: none;
          background: transparent;
          color: #71819b;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .seva-dashboard-tabs button:hover {
          color: white;
        }

        .seva-dashboard-tabs button.active {
          color: white;
          background: linear-gradient(
            135deg,
            #7624e9,
            #5131bd
          );
          box-shadow: 0 5px 20px rgba(101, 31, 218, 0.25);
        }

        .seva-dashboard-tabs button span {
          margin-left: 6px;
          padding: 2px 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          font-size: 9px;
        }

        .seva-metric-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .seva-metric-card {
          text-align: left;
          padding: 20px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.065);
          background: linear-gradient(
            145deg,
            rgba(19, 29, 48, 0.95),
            rgba(11, 19, 33, 0.95)
          );
          color: white;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .seva-metric-card:hover {
          transform: translateY(-4px);
          border-color: rgba(139, 61, 255, 0.35);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.18);
        }

        .seva-metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .seva-metric-header p {
          margin: 0;
          color: #72839d;
          font-size: 11px;
        }

        .seva-metric-icon {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #a55eff;
          background: rgba(139, 61, 255, 0.11);
        }

        .seva-metric-card > strong {
          display: block;
          margin: 13px 0 3px;
          font-size: 31px;
          letter-spacing: -0.03em;
        }

        .seva-metric-detail {
          color: #596981;
          font-size: 10px;
        }

        .seva-metric-line {
          height: 3px;
          margin-top: 16px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
        }

        .seva-metric-line span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #7624f0,
            #27bfff
          );
        }

        .seva-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 15px;
        }

        .seva-panel {
          padding: 24px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.065);
          background: linear-gradient(
            145deg,
            rgba(16, 25, 42, 0.96),
            rgba(10, 17, 30, 0.96)
          );
        }

        .seva-panel-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .seva-panel-heading > div:first-child span {
          color: #7558bc;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .seva-panel-heading h2 {
          margin: 5px 0 0;
          font-size: 19px;
        }

        .seva-live-badge,
        .seva-count-badge {
          padding: 6px 9px;
          border-radius: 999px;
          color: #37d795;
          background: rgba(55, 215, 149, 0.08);
          font-size: 9px;
          font-weight: 800;
        }

        .seva-live-badge {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .seva-live-badge span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #37d795;
          box-shadow: 0 0 8px #37d795;
        }

        .seva-snapshot-list {
          display: flex;
          flex-direction: column;
        }

        .seva-snapshot-list > div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .seva-snapshot-list span {
          color: #73839c;
          font-size: 12px;
        }

        .seva-snapshot-list strong {
          color: #edf3ff;
          font-size: 13px;
        }

        .seva-progress-section {
          margin-top: 21px;
        }

        .seva-progress-section > div:first-child {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: #71819a;
          font-size: 10px;
        }

        .seva-progress-section strong {
          color: white;
        }

        .seva-progress {
          height: 6px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
        }

        .seva-progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #7624f0,
            #20c8f3
          );
          transition: width 0.7s ease;
        }

        .seva-collapse {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.025);
          color: white;
          cursor: pointer;
          font-size: 17px;
        }

        .seva-ai-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .seva-ai-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .seva-ai-item:hover {
          border-color: rgba(139, 61, 255, 0.22);
          background: rgba(139, 61, 255, 0.06);
        }

        .seva-ai-number {
          width: 28px;
          height: 28px;
          min-width: 28px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(139, 61, 255, 0.12);
          color: #a86bff;
          font-size: 10px;
          font-weight: 800;
        }

        .seva-ai-item p {
          flex: 1;
          margin: 0;
          color: #a2afc2;
          font-size: 11px;
          line-height: 1.5;
        }

        .seva-ai-item > span {
          color: #7356aa;
        }

        .seva-ai-hidden {
          padding: 35px 10px;
          text-align: center;
          color: #63728a;
          font-size: 11px;
        }

        .seva-activity-list {
          display: flex;
          flex-direction: column;
        }

        .seva-activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .seva-activity-item:last-child {
          border-bottom: none;
        }

        .seva-activity-icon {
          width: 31px;
          height: 31px;
          min-width: 31px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 800;
        }

        .seva-activity-icon.success {
          color: #37d795;
          background: rgba(55, 215, 149, 0.08);
        }

        .seva-activity-icon.warning {
          color: #e9b75b;
          background: rgba(233, 183, 91, 0.08);
        }

        .seva-activity-icon.danger {
          color: #e26b86;
          background: rgba(226, 107, 134, 0.08);
        }

        .seva-activity-icon.info {
          color: #38bfe8;
          background: rgba(56, 191, 232, 0.08);
        }

        .seva-activity-item > div:nth-child(2) {
          flex: 1;
        }

        .seva-activity-item strong {
          display: block;
          color: #dce5f3;
          font-size: 11px;
        }

        .seva-activity-item span {
          display: block;
          margin-top: 3px;
          color: #62728a;
          font-size: 9px;
        }

        .seva-activity-item small {
          color: #4f6079;
          font-size: 9px;
        }

        .seva-health-content {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .seva-health-circle {
          width: 120px;
          height: 120px;
          min-width: 120px;
          display: grid;
          place-items: center;
          border-radius: 50%;
        }

        .seva-health-circle > div {
          width: 91px;
          height: 91px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          border-radius: 50%;
          background: #0d1627;
        }

        .seva-health-circle strong {
          font-size: 21px;
        }

        .seva-health-circle span {
          color: #667790;
          font-size: 9px;
        }

        .seva-health-stats {
          flex: 1;
          display: grid;
          gap: 10px;
        }

        .seva-health-stats div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 11px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.025);
        }

        .seva-health-stats strong {
          font-size: 13px;
        }

        .seva-health-stats span {
          color: #64748c;
          font-size: 9px;
        }

        .seva-expanded-panel {
          margin-top: 15px;
        }

        .seva-reservation-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .seva-reservation-item {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 14px;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .seva-reservation-number {
          width: 33px;
          height: 33px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(139, 61, 255, 0.1);
          color: #a46bff;
          font-size: 11px;
          font-weight: 800;
        }

        .seva-reservation-info {
          flex: 1;
        }

        .seva-reservation-info strong {
          display: block;
          font-size: 12px;
        }

        .seva-reservation-info span {
          color: #64738a;
          font-size: 10px;
        }

        .seva-status {
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .seva-status-confirmed,
        .seva-status-returned {
          color: #37d795;
          background: rgba(55, 215, 149, 0.08);
        }

        .seva-status-pending {
          color: #e9b75b;
          background: rgba(233, 183, 91, 0.08);
        }

        .seva-status-cancelled {
          color: #e26b86;
          background: rgba(226, 107, 134, 0.08);
        }

        .seva-tools-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .seva-tool-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 13px;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .seva-tool-image {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: linear-gradient(
            135deg,
            rgba(139, 61, 255, 0.17),
            rgba(38, 191, 239, 0.1)
          );
          font-size: 19px;
        }

        .seva-tool-card strong {
          display: block;
          margin-bottom: 5px;
          font-size: 11px;
        }

        .seva-tool-card span {
          font-size: 9px;
          text-transform: capitalize;
        }

        .tool-available {
          color: #37d795;
        }

        .tool-unavailable {
          color: #e9b75b;
        }

        .seva-empty-state {
          padding: 45px 20px;
          text-align: center;
        }

        .seva-empty-state > div {
          font-size: 30px;
          margin-bottom: 10px;
          color: #8651e9;
        }

        .seva-empty-state h3 {
          margin: 0 0 5px;
          font-size: 15px;
        }

        .seva-empty-state p {
          margin: 0;
          color: #62728a;
          font-size: 11px;
        }

        .seva-dashboard-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          margin-top: 15px;
          padding: 27px 30px;
          border-radius: 20px;
          background:
            radial-gradient(
              circle at 90% 50%,
              rgba(125, 39, 255, 0.28),
              transparent 35%
            ),
            linear-gradient(
              110deg,
              #101a2c,
              #15112c
            );
          border: 1px solid rgba(139, 61, 255, 0.13);
        }

        .seva-dashboard-cta > div > span {
          color: #7657b5;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .seva-dashboard-cta h2 {
          margin: 6px 0;
          font-size: 20px;
        }

        .seva-dashboard-cta p {
          margin: 0;
          color: #64748c;
          font-size: 11px;
        }

        .seva-dashboard-cta button {
          flex-shrink: 0;
          padding: 13px 19px;
          border: none;
          border-radius: 11px;
          color: white;
          background: linear-gradient(
            135deg,
            #7927ee,
            #3e8ee8
          );
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(101, 35, 214, 0.22);
          transition: transform 0.2s ease;
        }

        .seva-dashboard-cta button:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 900px) {
          .seva-dashboard-hero {
            grid-template-columns: 1fr;
          }

          .seva-dashboard-hero-card {
            max-width: 430px;
          }

          .seva-metric-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 680px) {
          .seva-dashboard {
            padding: 20px 15px 50px;
          }

          .seva-dashboard-hero {
            padding: 28px 22px;
          }

          .seva-content-grid {
            grid-template-columns: 1fr;
          }

          .seva-dashboard-tabs {
            width: 100%;
          }

          .seva-dashboard-tabs button {
            flex: 1;
            padding: 10px 7px;
          }

          .seva-dashboard-cta {
            flex-direction: column;
            align-items: flex-start;
          }

          .seva-dashboard-cta button {
            width: 100%;
          }

          .seva-tools-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}