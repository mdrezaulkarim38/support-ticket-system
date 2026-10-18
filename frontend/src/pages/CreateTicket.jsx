import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Sparkles } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";
import api, { getErrorMessage } from "../services/api";

export default function CreateTicket() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/tickets", {
        title: form.title.trim(),
        description: form.description.trim(),
      });
      toast.success("Ticket created successfully.");
      navigate(`/tickets/${data._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </button>

        <h1 className="mt-4 text-2xl font-semibold text-slate-800">
          New ticket
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Tell us what happened. Our AI will suggest a category and priority.
        </p>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Tip: include what you expected and what actually happened. The more
            detail you give, the better the AI classification.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Short summary of the problem"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              className="mt-1 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="What happened? What did you expect?"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading && <LoadingSpinner size="sm" />}
              {loading ? "Analyzing with AI..." : "Create ticket"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
