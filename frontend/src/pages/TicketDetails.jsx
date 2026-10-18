import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Alert from "../components/Alert";
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
  value ? new Date(value).toLocaleString() : "-";

export default function TicketDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    location.state?.created ? "Ticket created successfully." : ""
  );

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [commentError, setCommentError] = useState("");

  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        api.get(`/api/tickets/${id}`),
        api.get(`/api/tickets/${id}/comments`),
      ]);
      setTicket(ticketRes.data);
      setComments(commentsRes.data);
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
    setCommentError("");

    if (!message.trim()) {
      setCommentError("Please write a message.");
      return;
    }

    setSending(true);
    setCommentError("");
    setNotice("");
    try {
      const { data } = await api.post(`/api/tickets/${id}/comments`, {
        message: message.trim(),
      });
      setComments((prev) => [...prev, data]);
      setMessage("");
      setNotice("Comment added.");
    } catch (err) {
      setCommentError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!status) return;

    setUpdating(true);
    setStatusError("");
    setNotice("");
    try {
      const { data } = await api.patch(`/api/tickets/${id}/status`, { status });
      setTicket(data);
      setStatus("");
      setNotice(`Status updated to ${data.status}.`);
    } catch (err) {
      setStatusError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const isAgent = user?.role === "agent";
  const nextStatuses = ticket ? TRANSITIONS[ticket.status] || [] : [];

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link
          to="/dashboard"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          &larr; Back to tickets
        </Link>

        <Alert variant="success" className="mt-4">
          {notice}
        </Alert>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <Alert className="mt-4">{error}</Alert>
        ) : (
          <>
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-semibold text-slate-800">
                  {ticket.title}
                </h1>
                <StatusBadge status={ticket.status} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PriorityBadge priority={ticket.priority} />
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {ticket.category}
                </span>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">
                {ticket.description}
              </p>

              <dl className="mt-5 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-slate-600">Created by</dt>
                  <dd>{ticket.createdBy?.name || "-"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-600">Created</dt>
                  <dd>{formatDate(ticket.createdAt)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-600">Last updated</dt>
                  <dd>{formatDate(ticket.updatedAt)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-600">AI suggestion</dt>
                  <dd>
                    {ticket.aiSuggestedCategory || "-"} /{" "}
                    {ticket.aiSuggestedPriority || "-"}
                  </dd>
                </div>
              </dl>

              {isAgent && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-sm font-medium text-slate-700">
                    Change status
                  </p>

                  {statusError && (
                    <Alert className="mt-2">{statusError}</Alert>
                  )}

                  {nextStatuses.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">
                      This ticket is closed.
                    </p>
                  ) : (
                    <form
                      onSubmit={handleStatusChange}
                      className="mt-2 flex flex-wrap items-center gap-2"
                    >
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
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
                        className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
                      >
                        {updating ? "Updating..." : "Update"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            <section className="mt-6">
              <h2 className="text-lg font-semibold text-slate-800">
                Comments ({comments.length})
              </h2>

              <div className="mt-3 space-y-3">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No comments yet. Start the conversation.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-medium text-slate-700">
                          {comment.user?.name || "User"}
                          <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                            {comment.user?.role}
                          </span>
                        </span>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                        {comment.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleAddComment}
                className="mt-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
              >
                {commentError && (
                  <Alert className="mb-2">{commentError}</Alert>
                )}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Write a reply..."
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {sending && <LoadingSpinner size="sm" />}
                    {sending ? "Sending..." : "Add comment"}
                  </button>
                </div>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
