import React from 'react';

/**
 * A simple, reusable loading spinner component.
 * Displays a centered, spinning circle using Tailwind CSS animations.
 */
const LoadingSpinner = () => (
  <div className="flex justify-center items-center w-full h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-electric-blue" role="status" aria-label="Loading...">
    </div>
  </div>
);

export default LoadingSpinner;
