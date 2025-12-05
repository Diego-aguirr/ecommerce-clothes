import React from 'react';

interface CardProps {
  // Define props here
}

export const Card = ({}: CardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold">Card Title</h3>
      <p className="mt-2 text-gray-600">Card Content</p>
    </div>
  );
};
