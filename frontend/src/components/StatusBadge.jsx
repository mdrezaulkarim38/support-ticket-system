const STYLES = {
  Open: "bg-blue-50 text-blue-700 ring-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 ring-amber-200",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

const DOTS = {
  Open: "bg-blue-500",
  "In Progress": "bg-amber-500",
  Resolved: "bg-emerald-500",
  Closed: "bg-slate-400",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${
        STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          DOTS[status] || "bg-slate-400"
        }`}
      />
      {status}
    </span>
  );
}
