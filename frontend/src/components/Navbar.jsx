import { Link, NavLink, useNavigate } from "react-router-dom";
import { BarChart3, LifeBuoy, LogOut, Ticket } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive
      ? "bg-slate-100 text-slate-800"
      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-base font-semibold text-slate-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <LifeBuoy className="h-5 w-5" />
            </span>
            HelpDesk
          </Link>

          {user && (
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink to="/dashboard" className={navLinkClass}>
                <Ticket className="h-4 w-4" />
                Tickets
              </NavLink>
              {user.role === "agent" && (
                <NavLink to="/analytics" className={navLinkClass}>
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </NavLink>
              )}
            </nav>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={user.name} size="sm" />
              <div className="leading-tight">
                <p className="text-sm font-medium text-slate-800">{user.name}</p>
                <p className="text-xs capitalize text-slate-500">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
