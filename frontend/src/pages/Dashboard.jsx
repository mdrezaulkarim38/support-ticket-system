import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
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
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = filter === "All" ? {} : { status: filter };
      const { data } = await api.get("/api/tickets", { params });
      setTickets(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Tickets</h1>
            <p className="text-sm text-slate-500">
              {user?.role === "agent"
                ? "All tickets across the desk."
                : "Your support tickets."}
            </p>
          </div>

          {user?.role === "customer" && (
            <Link
              to="/tickets/new"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              New ticket
            </Link>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                filter === status
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <Alert>{error}</Alert>
          ) : tickets.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
              No tickets found.
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <TicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
