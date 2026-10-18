export default function LoadingSpinner({ size = "md" }) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-10 w-10 border-4",
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizes[size]} animate-spin rounded-full border-slate-300 border-t-blue-600`}
    />
  );
}
