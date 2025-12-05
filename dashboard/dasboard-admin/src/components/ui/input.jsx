// src/components/ui/input.jsx
export function Input({
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
  ...props
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 
                  focus:outline-none focus:ring-2 focus:ring-[#2B484F]
                  transition-all duration-200 ${className}`}
      {...props}
    />
  );
}
