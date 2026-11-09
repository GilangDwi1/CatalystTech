import React from "react";

export function Dialog({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Background blur transparan */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* Modal box */}
      <div
        className="relative bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg mx-4 
                   transition-all duration-300 transform scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children }) {
  return <div className="mt-4">{children}</div>;
}

export function DialogHeader({ children }) {
  return <div className="border-b pb-2 mb-4">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h2 className="text-xl font-semibold text-gray-800">{children}</h2>;
}

export function DialogFooter({ children }) {
  return (
    <div className="mt-6 flex justify-end gap-2 border-t pt-3">{children}</div>
  );
}
