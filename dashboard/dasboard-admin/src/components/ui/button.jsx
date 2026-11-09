export function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg font-medium text-white transition ${className}`}
    >
      {children}
    </button>
  );
}
