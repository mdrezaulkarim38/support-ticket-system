import { Navigate, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-2xl font-semibold text-slate-800">
        Support Ticket System
      </h1>
      <p className="mt-2 text-slate-600">Frontend scaffold ready.</p>

      <Routes>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
