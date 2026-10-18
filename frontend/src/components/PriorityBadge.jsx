import { ArrowDown, ArrowUp, Minus, Flame } from "lucide-react";

const PRIORITY_STYLES = {
  Low: { cls: "bg-slate-100 text-slate-600 ring-slate-200", Icon: ArrowDown },
  Medium: { cls: "bg-sky-50 text-sky-700 ring-sky-200", Icon: Minus },
  High: { cls: "bg-orange-50 text-orange-700 ring-orange-200", Icon: ArrowUp },
  Urgent: { cls: "bg-rose-50 text-rose-700 ring-rose-200", Icon: Flame },
};

export default function PriorityBadge({ priority }) {
  const { cls, Icon } = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Low;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${cls}`}
    >
      <Icon className="h-3 w-3" />
      {priority}
    </span>
  );
}
