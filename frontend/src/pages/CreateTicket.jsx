import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";
import api, { getErrorMessage } from "../services/api";

export default function CreateTicket() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/tickets", {
        title: form.title.trim(),
        description: form.description.trim(),
      });
      navigate(`/tickets/${data._id}`, { state: { created: true } });
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-xl font-semibold text-slate-800">New ticket</h1>
        <p className="mt-1 text-sm text-slate-500">
          Describe your issue and our AI will suggest a category and priority.
        </p>

        <Alert className="mt-4">{error}</Alert>

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
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
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              className="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="What happened? What did you expect?"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading && <LoadingSpinner size="sm" />}
              {loading ? "Analyzing with AI..." : "Create ticket"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
