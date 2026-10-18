import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Inbox,
  Layers,
  Loader2,
  Plus,
  Ticket as TicketIcon,
  CheckCircle2,
} from "lucide-react";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";
import TicketCard from "../components/TicketCard";
import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../services/api";

const FILTERS = ["All", "Open", "In Progress", "Resolved", "Closed"];

export default function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/tickets");
      setTickets(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const stats = useMemo(() => {
    const count = (status) =>
      tickets.filter((t) => t.status === status).length;
    return [
      { label: "Total", value: tickets.length, Icon: Layers, tone: "text-slate-600 bg-slate-100" },
      { label: "Open", value: count("Open"), Icon: Inbox, tone: "text-blue-600 bg-blue-50" },
      { label: "In Progress", value: count("In Progress"), Icon: Loader2, tone: "text-amber-600 bg-amber-50" },
      { label: "Resolved", value: count("Resolved"), Icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
    ];
  }, [tickets]);

  const filtered = useMemo(
    () => (filter === "All" ? tickets : tickets.filter((t) => t.status === filter)),
    [tickets, filter]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Tickets</h1>
            <p className="mt-1 text-sm text-slate-500">
              {user?.role === "agent"
                ? "Every ticket across the desk."
                : "Your support tickets."}
            </p>
          </div>

          {user?.role === "customer" && (
            <Link
              to="/tickets/new"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              New ticket
            </Link>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ label, value, Icon, tone }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  {label}
                </span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-800">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((status) => {
            const count =
              status === "All"
                ? tickets.length
                : tickets.filter((t) => t.status === status).length;
            const active = filter === status;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-slate-800 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                }`}
              >
                {status}
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    active ? "bg-white/20" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={TicketIcon}
              title="No tickets here"
              description={
                filter === "All"
                  ? "There are no tickets yet."
                  : `No tickets with status "${filter}".`
              }
              action={
                user?.role === "customer" && (
                  <Link
                    to="/tickets/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create a ticket
                  </Link>
                )
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((ticket) => (
                <TicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
