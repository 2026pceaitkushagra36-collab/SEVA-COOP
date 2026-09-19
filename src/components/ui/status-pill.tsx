type StatusPillProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  reserved: "bg-sky-100 text-sky-800 ring-sky-200",
  picked_up: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  maintenance: "bg-amber-100 text-amber-900 ring-amber-200",
  pending: "bg-amber-100 text-amber-900 ring-amber-200",
  approved: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  rejected: "bg-rose-100 text-rose-800 ring-rose-200",
  returned: "bg-slate-100 text-slate-700 ring-slate-200",
  cancelled: "bg-rose-100 text-rose-800 ring-rose-200",
};

export function StatusPill({ status }: StatusPillProps) {
  const label = status.replace("_", " ");

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${
        statusStyles[status] ?? "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {label}
    </span>
  );
}
