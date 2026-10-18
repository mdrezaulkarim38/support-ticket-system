import { Link } from "react-router-dom";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

export default function TicketCard({ ticket }) {
  return (
    <Link
      to={`/tickets/${ticket._id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-medium text-slate-800">{ticket.title}</h3>
        <StatusBadge status={ticket.status} />
      </div>

      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
        {ticket.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={ticket.priority} />
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {ticket.category}
        </span>
        {ticket.createdBy?.name && (
          <span className="text-xs text-slate-400">by {ticket.createdBy.name}</span>
        )}
      </div>
    </Link>
  );
}
