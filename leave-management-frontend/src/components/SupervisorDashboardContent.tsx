import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config/api";
import ToastContainer, { useToast } from "./ToastContainer";
import { LEAVE_STATUS, normalizeLeaveStatus } from "../constants/leaveStatus";
import "../css/supervisorDashboard.css";

const CHART_COLORS = ["#0d9488", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#ef4444"];

interface Requester {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface PendingLeaveRow {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  documentUrl: string;
  requester: Requester;
  currentStep: number;
  totalSteps: number;
}

interface ApiPendingRow {
  _id?: string;
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  daysRequested?: number;
  reason?: string;
  status?: string;
  documentUrl?: string | null;
  requester?: Requester | string;
  currentStep?: number;
  totalSteps?: number;
}

function normalizePendingRow(row: ApiPendingRow): PendingLeaveRow | null {
  const id = row._id;
  if (!id) return null;
  let requester: Requester = {
    _id: "",
    fullName: "Unknown",
    email: "",
    role: "EMPLOYEE",
  };
  if (row.requester && typeof row.requester === "object") {
    requester = {
      _id: row.requester._id ?? "",
      fullName: row.requester.fullName ?? "Unknown",
      email: row.requester.email ?? "",
      role: row.requester.role ?? "EMPLOYEE",
    };
  }
  return {
    id,
    leaveType: row.leaveType ?? "—",
    startDate: row.startDate ?? "",
    endDate: row.endDate ?? "",
    days: row.days ?? row.daysRequested ?? 0,
    reason: row.reason ?? "",
    status: normalizeLeaveStatus(row.status) as string,
    documentUrl: row.documentUrl ?? "",
    requester,
    currentStep: row.currentStep ?? 1,
    totalSteps: row.totalSteps ?? 1,
  };
}

interface SupervisorDashboardContentProps {
  user: { fullName?: string; name?: string } | null;
  /** Dashboard overview vs dedicated approvals tab */
  view?: "dashboard" | "approvals";
}

const SupervisorDashboardContent: React.FC<SupervisorDashboardContentProps> = ({
  user,
  view = "dashboard",
}) => {
  const { toasts, addToast, removeToast } = useToast();
  const [rows, setRows] = useState<PendingLeaveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setRows([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/leaves/pending`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
      });
      if (!res.ok) {
        throw new Error("Failed to load pending leaves");
      }
      const data = await res.json();
      const raw: ApiPendingRow[] = Array.isArray(data) ? data : (data?.data ?? []);
      const list = (Array.isArray(raw) ? raw : [])
        .map(normalizePendingRow)
        .filter((r): r is PendingLeaveRow => r !== null);
      setRows(list);
    } catch (e) {
      console.error(e);
      addToast("Could not load pending leave requests.", "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void fetchPending();
  }, [fetchPending]);

  const stats = useMemo(() => {
    const atMyStep = rows.filter((r) => r.currentStep === 1).length;
    const awaitingNext = rows.filter((r) => r.currentStep > 1).length;
    const uniqueRequesters = new Set(rows.map((r) => r.requester._id || r.requester.email)).size;
    const totalDays = rows.reduce((s, r) => s + (r.days || 0), 0);
    return {
      total: rows.length,
      atMyStep,
      awaitingNext,
      uniqueRequesters,
      totalDays,
    };
  }, [rows]);

  const byLeaveType = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) {
      m.set(r.leaveType, (m.get(r.leaveType) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const byStep = useMemo(() => {
    const m = new Map<number, number>();
    for (const r of rows) {
      const step = r.currentStep || 1;
      m.set(step, (m.get(step) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [rows]);

  const handleApprove = async (leaveId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      addToast("You must be logged in.", "error");
      return;
    }
    setBusyId(leaveId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/leaves/${leaveId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("approve failed");
      addToast("Leave approved at your step.", "success");
      await fetchPending();
    } catch {
      addToast("Approval failed. Try again or check your permissions.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (leaveId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      addToast("You must be logged in.", "error");
      return;
    }
    setBusyId(leaveId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/leaves/${leaveId}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("reject failed");
      addToast("Leave rejected.", "success");
      await fetchPending();
    } catch {
      addToast("Rejection failed. Try again or check your permissions.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const displayName = user?.fullName || user?.name || "Supervisor";
  const rootClass = view === "approvals" ? "supervisor-dashboard supervisor-approvals-only" : "supervisor-dashboard";

  return (
    <div className={rootClass}>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="supervisor-approvals-header">
        <h1 className="supervisor-dashboard-h1">Pending approvals</h1>
        <p className="supervisor-dashboard-lead">
          Requests that are still open in the workflow. Act on items at step 1; others are waiting on
          the next approver.
        </p>
      </div>

      <motion.div
        className="supervisor-dashboard-hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="supervisor-dashboard-hero-main">
          <h1 className="supervisor-dashboard-h1">Supervisor overview</h1>
          <p className="supervisor-dashboard-lead">
            Welcome, {displayName}. Use the charts to see what is in your queue, then approve or reject
            requests that need your decision at the current step.
          </p>
        </div>
        <div className="supervisor-dashboard-hero-aside">
          <p style={{ margin: 0, opacity: 0.9, fontSize: 13 }}>Open pipeline</p>
          <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700 }}>{stats.total}</p>
        </div>
      </motion.div>

      <div className="supervisor-stat-grid">
        <StatCard label="Pending in queue" value={stats.total} accent="#0d9488" />
        <StatCard label="Needs your action (step 1)" value={stats.atMyStep} accent="#f59e0b" />
        <StatCard label="Awaiting next approver" value={stats.awaitingNext} accent="#6366f1" />
        <StatCard label="Team members represented" value={stats.uniqueRequesters} accent="#14b8a6" />
        <StatCard label="Total days (pending)" value={stats.totalDays} accent="#8b5cf6" />
      </div>

      <div className="supervisor-charts">
        <div className="supervisor-chart-card">
          <h3 className="supervisor-chart-title">Pending by leave type</h3>
          {byLeaveType.length === 0 ? (
            <p className="supervisor-chart-empty">No pending requests.</p>
          ) : (
            <>
              <TypeDonut entries={byLeaveType} />
              <HorizontalBars entries={byLeaveType} />
            </>
          )}
        </div>
        <div className="supervisor-chart-card">
          <h3 className="supervisor-chart-title">By workflow step</h3>
          {byStep.length === 0 ? (
            <p className="supervisor-chart-empty">No pending requests.</p>
          ) : (
            <StepBars entries={byStep} maxCount={Math.max(...byStep.map(([, n]) => n), 1)} />
          )}
        </div>
      </div>

      <section className="supervisor-section">
        <h2 className="supervisor-section-title">Review queue</h2>
        {loading ? (
          <p className="supervisor-chart-empty">Loading pending requests…</p>
        ) : rows.length === 0 ? (
          <p className="supervisor-chart-empty">No pending leave requests. You are all caught up.</p>
        ) : (
          <div className="supervisor-pending-grid">
            {rows.map((leave) => (
              <PendingCard
                key={leave.id}
                leave={leave}
                busy={busyId === leave.id}
                onApprove={() => void handleApprove(leave.id)}
                onReject={() => void handleReject(leave.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="supervisor-stat-card" style={{ borderTop: `4px solid ${accent}` }}>
      <p className="supervisor-stat-label">{label}</p>
      <p className="supervisor-stat-value">{value}</p>
    </div>
  );
}

function TypeDonut({ entries }: { entries: [string, number][] }) {
  const total = entries.reduce((s, [, n]) => s + n, 0);
  if (total <= 0) return null;
  let acc = 0;
  const parts = entries.map(([_, count], i) => {
    const start = (acc / total) * 100;
    acc += count;
    const end = (acc / total) * 100;
    return `${CHART_COLORS[i % CHART_COLORS.length]} ${start}% ${end}%`;
  });
  const gradient = `conic-gradient(${parts.join(", ")})`;
  return (
    <div className="supervisor-donut-wrap" style={{ marginBottom: 16 }}>
      <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: gradient,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        />
      </div>
      <div className="supervisor-donut-legend">
        {entries.map(([label, count], i) => (
          <div key={label} className="supervisor-legend-item">
            <span
              className="supervisor-legend-swatch"
              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <span>
              {label} ({count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalBars({ entries }: { entries: [string, number][] }) {
  const max = Math.max(...entries.map(([, n]) => n), 1);
  return (
    <div>
      {entries.map(([label, count], i) => (
        <div key={label} className="supervisor-bar-row">
          <span className="supervisor-bar-name" title={label}>
            {label}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{count}</span>
          <div className="supervisor-bar-track">
            <div
              className="supervisor-bar-fill"
              style={{
                width: `${(count / max) * 100}%`,
                background: CHART_COLORS[i % CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StepBars({ entries, maxCount }: { entries: [number, number][]; maxCount: number }) {
  return (
    <div>
      {entries.map(([step, count], i) => (
        <div key={step} className="supervisor-bar-row">
          <span className="supervisor-bar-name">
            Step {step} {step === 1 ? "(your queue)" : ""}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{count}</span>
          <div className="supervisor-bar-track">
            <div
              className="supervisor-bar-fill"
              style={{
                width: `${(count / maxCount) * 100}%`,
                background: CHART_COLORS[i % CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingCard({
  leave,
  busy,
  onApprove,
  onReject,
}: {
  leave: PendingLeaveRow;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const status = normalizeLeaveStatus(leave.status);
  const canAct = status === LEAVE_STATUS.PENDING && leave.currentStep === 1;

  return (
    <motion.article
      className={`supervisor-pending-card${canAct ? "" : " supervisor-pending-card--waiting"}`}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="supervisor-pending-header">
        <div style={{ minWidth: 0 }}>
          <p className="supervisor-pending-name">{leave.requester.fullName}</p>
          <p className="supervisor-pending-email">{leave.requester.email}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span className="supervisor-badge supervisor-badge--step">
            Step {leave.currentStep}/{leave.totalSteps}
          </span>
          {canAct ? (
            <span className="supervisor-badge supervisor-badge--action">Action required</span>
          ) : (
            <span className="supervisor-badge supervisor-badge--step">Awaiting next approver</span>
          )}
        </div>
      </div>
      <p className="supervisor-pending-meta">
        <strong>{leave.leaveType}</strong> · {formatRange(leave.startDate, leave.endDate)} ·{" "}
        {leave.days} day(s)
      </p>
      <p className="supervisor-pending-reason">{leave.reason || "—"}</p>
      {leave.documentUrl ? (
        <a className="supervisor-link" href={leave.documentUrl} target="_blank" rel="noopener noreferrer">
          View attachment
        </a>
      ) : null}
      {canAct ? (
        <div className="supervisor-pending-actions">
          <button type="button" className="supervisor-btn supervisor-btn--approve" disabled={busy} onClick={onApprove}>
            {busy ? "Working…" : "Approve"}
          </button>
          <button type="button" className="supervisor-btn supervisor-btn--reject" disabled={busy} onClick={onReject}>
            Reject
          </button>
        </div>
      ) : (
        <p className="supervisor-chart-empty" style={{ margin: 0, paddingTop: 4 }}>
          You cannot approve or reject this item until it returns to your step.
        </p>
      )}
    </motion.article>
  );
}

function formatRange(start: string, end: string) {
  const o: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
  try {
    const a = new Date(start).toLocaleDateString(undefined, o);
    const b = new Date(end).toLocaleDateString(undefined, o);
    return `${a} – ${b}`;
  } catch {
    return `${start} – ${end}`;
  }
}

export default SupervisorDashboardContent;
