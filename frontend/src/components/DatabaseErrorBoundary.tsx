"use client";

import { useState, useEffect } from "react";

interface DatabaseErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function DatabaseErrorBoundary({ 
  children, 
  fallback 
}: DatabaseErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes("relation") || 
          event.message?.includes("does not exist") ||
          event.message?.includes("42P01")) {
        setHasError(true);
        setErrorMessage("Database schema not applied. Please run the setup script.");
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return fallback || (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Database Setup Required
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {errorMessage}
          </p>
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <p className="text-sm font-mono text-gray-700">
              npm run setup:vault
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
