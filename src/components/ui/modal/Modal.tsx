import React from "react";

export const Modal = () => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold">Modal Title</h2>
        <p className="mt-4">Modal Content</p>
      </div>
    </div>
  );
};
