import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  Layers,
  Loader2,
  Plus,
  Search,
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
const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "updated", label: "Recently updated" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title (A-Z)" },
];

const LIMIT = 10;

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [stats, setStats] = useState({ total: 0, byStatus: {}, byPriority: {} });
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    api
      .get("/api/tickets/stats")
      .then(({ data: statsData }) => setStats(statsData))
      .catch(() => {});
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, sort };
      if (filter !== "All") params.status = filter;
      if (query) params.q = query;
      const { data: listData } = await api.get("/api/tickets", { params });
      setData(listData);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, filter, sort, query]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const countFor = (status) =>
    status === "All" ? stats.total : stats.byStatus?.[status] || 0;

  const statCards = [
    { label: "Total", value: stats.total, Icon: Layers, tone: "text-slate-600 bg-slate-100" },
    { label: "Open", value: stats.byStatus?.Open || 0, Icon: Inbox, tone: "text-blue-600 bg-blue-50" },
    { label: "In Progress", value: stats.byStatus?.["In Progress"] || 0, Icon: Loader2, tone: "text-amber-600 bg-amber-50" },
    { label: "Resolved", value: stats.byStatus?.Resolved || 0, Icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
  ];

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
          {statCards.map(({ label, value, Icon, tone }) => (
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

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((status) => {
            const active = filter === status;
            return (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setPage(1);
                }}
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
                  {countFor(status)}
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
          ) : data.items.length === 0 ? (
            <EmptyState
              icon={TicketIcon}
              title="No tickets here"
              description={
                query
                  ? `No tickets match "${query}".`
                  : filter === "All"
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
            <>
              <div className="space-y-3">
                {data.items.map((ticket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>

              {data.pages > 1 && (
                <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                  <span>
                    Page {data.page} of {data.pages} · {data.total} tickets
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={data.page <= 1}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, data.pages))
                      }
                      disabled={data.page >= data.pages}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
