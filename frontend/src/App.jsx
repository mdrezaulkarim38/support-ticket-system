import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function Placeholder({ title }) {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Placeholder title="Login" />} />
        <Route path="/register" element={<Placeholder title="Register" />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
          <Route
            path="/tickets/new"
            element={<Placeholder title="Create Ticket" />}
          />
          <Route
            path="/tickets/:id"
            element={<Placeholder title="Ticket Details" />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
