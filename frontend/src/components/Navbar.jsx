import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="text-lg font-semibold text-slate-800">
          Support Tickets
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {user && (
            <span className="hidden text-slate-500 sm:inline">
              {user.name}
              <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {user.role}
              </span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-md bg-slate-800 px-3 py-1.5 font-medium text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
