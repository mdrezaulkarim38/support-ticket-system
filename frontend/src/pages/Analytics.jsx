import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  BarChart3,
  CheckCircle2,
  Inbox,
  Layers,
  Loader2,
  TrendingUp,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";
import api, { getErrorMessage } from "../services/api";

const STATUS_COLORS = {
  Open: "bg-blue-500",
  "In Progress": "bg-amber-500",
  Resolved: "bg-emerald-500",
  Closed: "bg-slate-400",
};

const PRIORITY_COLORS = {
  Urgent: "bg-rose-500",
  High: "bg-orange-500",
  Medium: "bg-sky-500",
  Low: "bg-slate-400",
};

function BarRow({ label, count, max, color }) {
  const width = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-800">{count}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/tickets/stats")
      .then(({ data }) => setStats(data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const total = stats?.total || 0;
  const resolved =
    (stats?.byStatus?.Resolved || 0) + (stats?.byStatus?.Closed || 0);
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

  const cards = [
    { label: "Total tickets", value: total, Icon: Layers, tone: "text-slate-600 bg-slate-100" },
    { label: "Resolution rate", value: `${resolutionRate}%`, Icon: TrendingUp, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Open", value: stats?.byStatus?.Open || 0, Icon: Inbox, tone: "text-blue-600 bg-blue-50" },
    { label: "In progress", value: stats?.byStatus?.["In Progress"] || 0, Icon: Loader2, tone: "text-amber-600 bg-amber-50" },
  ];

  const statusMax = Math.max(1, ...Object.values(stats?.byStatus || {}));
  const priorityMax = Math.max(1, ...Object.values(stats?.byPriority || {}));
  const categoryMax = Math.max(
    1,
    ...(stats?.byCategory || []).map((c) => c.count)
  );
  const trendMax = Math.max(1, ...(stats?.trend || []).map((t) => t.count));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-semibold text-slate-800">Analytics</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          A snapshot of ticket volume across the desk.
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : !stats ? (
          <p className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Analytics unavailable.
          </p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {cards.map(({ label, value, Icon, tone }) => (
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

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-800">
                  By status
                </h2>
                <div className="mt-4 space-y-3">
                  {Object.entries(stats.byStatus).map(([label, count]) => (
                    <BarRow
                      key={label}
                      label={label}
                      count={count}
                      max={statusMax}
                      color={STATUS_COLORS[label] || "bg-slate-400"}
                    />
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-800">
                  By priority
                </h2>
                <div className="mt-4 space-y-3">
                  {Object.entries(stats.byPriority).map(([label, count]) => (
                    <BarRow
                      key={label}
                      label={label}
                      count={count}
                      max={priorityMax}
                      color={PRIORITY_COLORS[label] || "bg-slate-400"}
                    />
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-800">
                  By category
                </h2>
                <div className="mt-4 space-y-3">
                  {stats.byCategory.length === 0 ? (
                    <p className="text-sm text-slate-500">No data yet.</p>
                  ) : (
                    stats.byCategory.map(({ category, count }) => (
                      <BarRow
                        key={category}
                        label={category}
                        count={count}
                        max={categoryMax}
                        color="bg-indigo-500"
                      />
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Last 7 days
                </h2>
                <div className="mt-5 flex h-40 items-end justify-between gap-2">
                  {stats.trend.map(({ date, count }) => {
                    const height = Math.round((count / trendMax) * 100);
                    const day = new Date(date).toLocaleDateString(undefined, {
                      weekday: "short",
                    });
                    return (
                      <div
                        key={date}
                        className="flex flex-1 flex-col items-center gap-2"
                      >
                        <span className="text-xs font-medium text-slate-500">
                          {count}
                        </span>
                        <div className="flex h-full w-full items-end">
                          <div
                            className="w-full rounded-t-md bg-indigo-500"
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
