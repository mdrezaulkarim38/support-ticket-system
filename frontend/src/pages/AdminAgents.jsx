import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Mail, ShieldCheck, UserPlus, Users } from "lucide-react";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";
import api, { getErrorMessage } from "../services/api";

const emptyForm = { name: "", email: "", password: "" };

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/users/agents");
      setAgents(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/users/agents", form);
      toast.success(`${form.name} added as an agent.`);
      setForm(emptyForm);
      await loadAgents();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-semibold text-slate-800">
            Manage agents
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Create agent accounts and assign them tickets from the ticket view.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-slate-800">
              Agents
              <span className="ml-2 font-normal text-slate-400">
                ({agents.length})
              </span>
            </h2>

            <div className="mt-3 space-y-3">
              {loading ? (
                <div className="flex justify-center py-16">
                  <LoadingSpinner />
                </div>
              ) : agents.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No agents yet"
                  description="Create your first agent using the form."
                />
              ) : (
                agents.map((agent) => (
                  <div
                    key={agent._id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <Avatar name={agent.name} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800">
                        {agent.name}
                      </p>
                      <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                        <Mail className="h-3 w-3" />
                        {agent.email}
                      </p>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium capitalize text-indigo-700">
                      <ShieldCheck className="h-3 w-3" />
                      {agent.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <UserPlus className="h-4 w-4 text-indigo-600" />
                Add a new agent
              </h2>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Full name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="jane@company.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Temporary password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                    minLength={6}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="At least 6 characters"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4" />
                  {saving ? "Creating..." : "Create agent"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
