import React from 'react';

interface InputProps {
  // Define props here
}

export const Input = ({}: InputProps) => {
  return (
    <input type="text" className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Input" />
  );
};
