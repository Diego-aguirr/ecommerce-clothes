import React from 'react';

interface SpinnerProps {
  // Define props here
}

export const Spinner = ({}: SpinnerProps) => {
  return (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  );
};
