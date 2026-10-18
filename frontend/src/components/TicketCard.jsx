import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import Avatar from "./Avatar";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

export default function TicketCard({ ticket }) {
  return (
    <Link
      to={`/tickets/${ticket._id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={ticket.createdBy?.name || "User"} />
          <div className="min-w-0">
            <h3 className="truncate font-medium text-slate-800 group-hover:text-indigo-700">
              {ticket.title}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
              {ticket.description}
            </p>
          </div>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 pl-12 text-xs text-slate-400">
        <PriorityBadge priority={ticket.priority} />
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
          {ticket.category}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
        {ticket.createdBy?.name && <span>by {ticket.createdBy.name}</span>}
      </div>
    </Link>
  );
}
