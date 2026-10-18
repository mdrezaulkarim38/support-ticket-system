import { Link } from "react-router-dom";
import { LifeBuoy } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
        <LifeBuoy className="h-6 w-6" />
      </span>
      <p className="mt-5 text-5xl font-bold tracking-tight text-slate-300">
        404
      </p>
      <h1 className="mt-2 text-xl font-semibold text-slate-800">
        Page not found
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
