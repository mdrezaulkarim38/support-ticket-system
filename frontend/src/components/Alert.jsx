const VARIANTS = {
  error: "bg-red-50 text-red-700",
  success: "bg-green-50 text-green-700",
  info: "bg-blue-50 text-blue-700",
};

export default function Alert({ variant = "error", className = "", children }) {
  if (!children) return null;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-md px-3 py-2 text-sm ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
