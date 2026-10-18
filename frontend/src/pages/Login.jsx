import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LifeBuoy, ShieldCheck, Sparkles } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (email) =>
    setForm({ email, password: "123456" });

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <LifeBuoy className="h-5 w-5" />
          </span>
          HelpDesk
        </div>

        <div>
          <h1 className="text-3xl font-semibold leading-tight">
            Support that sorts itself.
          </h1>
          <p className="mt-3 max-w-sm text-indigo-100">
            AI-powered ticket triage that classifies and prioritises every
            request the moment it arrives.
          </p>

          <ul className="mt-8 space-y-4 text-sm text-indigo-50">
            <li className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 shrink-0" />
              Automatic category &amp; priority suggestions
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              Secure role-based access for customers and agents
            </li>
          </ul>
        </div>

        <p className="text-xs text-indigo-200">
          Full Stack Developer Assessment · NT Tech Innovation
        </p>
      </aside>

      <main className="flex items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-800 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <LifeBuoy className="h-5 w-5" />
            </span>
            HelpDesk
          </div>

          <h2 className="text-2xl font-semibold text-slate-800">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back. Enter your details to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading && <LoadingSpinner size="sm" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            No account?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:underline"
            >
              Create one
            </Link>
          </p>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-600">
              Demo accounts — click to fill
            </p>
            <div className="mt-2 space-y-2">
              <button
                type="button"
                onClick={() => quickFill("customer@example.com")}
                className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-xs text-slate-600 transition hover:bg-slate-100"
              >
                <span>Customer</span>
                <span className="font-mono">customer@example.com</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill("agent@example.com")}
                className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-xs text-slate-600 transition hover:bg-slate-100"
              >
                <span>Agent</span>
                <span className="font-mono">agent@example.com</span>
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Password for both: <span className="font-mono">123456</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
