import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Analytics from "./pages/Analytics";
import CreateTicket from "./pages/CreateTicket";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import TicketDetails from "./pages/TicketDetails";

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: "14px" },
          success: { iconTheme: { primary: "#16a34a", secondary: "#ffffff" } },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tickets/:id" element={<TicketDetails />} />
        </Route>

        <Route element={<ProtectedRoute roles={["customer"]} />}>
          <Route path="/tickets/new" element={<CreateTicket />} />
        </Route>

        <Route element={<ProtectedRoute roles={["agent"]} />}>
          <Route path="/analytics" element={<Analytics />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
