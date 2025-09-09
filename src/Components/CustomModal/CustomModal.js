// CustomModal.js
import React from "react";

export default function CustomModal({ children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}