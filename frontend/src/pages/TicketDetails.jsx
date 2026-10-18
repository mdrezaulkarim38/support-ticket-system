import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CalendarDays,
  MessageSquare,
  Send,
  Sparkles,
  Tag,
  User as UserIcon,
} from "lucide-react";
import Avatar from "../components/Avatar";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../services/api";

const TRANSITIONS = {
  Open: ["In Progress", "Closed"],
  "In Progress": ["Resolved", "Closed"],
  Resolved: ["Closed"],
  Closed: [],
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";

export default function TicketDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        api.get(`/api/tickets/${id}`),
        api.get(`/api/tickets/${id}/comments`),
      ]);
      setTicket(ticketRes.data);
      setComments(commentsRes.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Please write a message.");
      return;
    }

    setSending(true);
    try {
      const { data } = await api.post(`/api/tickets/${id}/comments`, {
        message: message.trim(),
      });
      setComments((prev) => [...prev, data]);
      setMessage("");
      toast.success("Comment added.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!status) return;

    setUpdating(true);
    try {
      const { data } = await api.patch(`/api/tickets/${id}/status`, { status });
      setTicket(data);
      setStatus("");
      toast.success(`Status updated to ${data.status}.`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const isAgent = user?.role === "agent";
  const nextStatuses = ticket ? TRANSITIONS[ticket.status] || [] : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            {error}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-xl font-semibold text-slate-800">
                    {ticket.title}
                  </h1>
                  <StatusBadge status={ticket.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={ticket.priority} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    <Tag className="h-3 w-3" />
                    {ticket.category}
                  </span>
                </div>

                <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {ticket.description}
                </p>
              </article>

              <section className="mt-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <MessageSquare className="h-5 w-5 text-slate-400" />
                  Comments
                  <span className="text-sm font-normal text-slate-400">
                    ({comments.length})
                  </span>
                </h2>

                <div className="mt-3 space-y-3">
                  {comments.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                      No comments yet. Start the conversation.
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <Avatar
                          name={comment.user?.name || "User"}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                            <span className="font-medium text-slate-700">
                              {comment.user?.name || "User"}
                              <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 font-medium capitalize text-slate-600">
                                {comment.user?.role}
                              </span>
                            </span>
                            <span>{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-700">
                            {comment.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form
                  onSubmit={handleAddComment}
                  className="mt-4 flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <Avatar name={user?.name || "You"} size="sm" />
                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Write a reply..."
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={sending}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
                      >
                        {sending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        {sending ? "Sending..." : "Add comment"}
                      </button>
                    </div>
                  </div>
                </form>
              </section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800">Details</h3>
                <dl className="mt-3 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Status</dt>
                    <dd>
                      <StatusBadge status={ticket.status} />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Priority</dt>
                    <dd>
                      <PriorityBadge priority={ticket.priority} />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Category</dt>
                    <dd className="font-medium text-slate-700">
                      {ticket.category}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-start gap-2 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-700">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    AI suggested{" "}
                    <strong>{ticket.aiSuggestedCategory || "-"}</strong> ·{" "}
                    <strong>{ticket.aiSuggestedPriority || "-"}</strong>
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800">People</h3>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Avatar name={ticket.createdBy?.name || "User"} size="sm" />
                    <div className="leading-tight">
                      <p className="font-medium text-slate-700">
                        {ticket.createdBy?.name || "-"}
                      </p>
                      <p className="text-xs text-slate-400">Requested by</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    Created {formatDate(ticket.createdAt)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    Updated {formatDate(ticket.updatedAt)}
                  </div>
                </div>
              </div>

              {isAgent && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Change status
                  </h3>

                  {nextStatuses.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">
                      This ticket is closed.
                    </p>
                  ) : (
                    <form onSubmit={handleStatusChange} className="mt-3 space-y-3">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="">Select a status...</option>
                        {nextStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={updating || !status}
                        className="w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
                      >
                        {updating ? "Updating..." : "Update status"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
