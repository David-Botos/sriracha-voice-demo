import React from 'react';
import JsonVisualizer from './JsonVisualizer';

interface StructuredOutputViewerProps {
  data: any;
  isLoading?: boolean;
  error?: string;
  title?: string;
}

const StructuredOutputViewer: React.FC<StructuredOutputViewerProps> = ({
  data,
  isLoading = false,
  error,
  title = 'Structured Output'
}) => {
  // Show loading state
  if (isLoading) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div className="border border-gray-200 rounded-lg p-8 bg-white flex justify-center items-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-500">Processing transcript...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div className="border border-red-100 rounded-lg p-4 bg-red-50 text-red-600">
          <p className="font-medium">Error processing structured output</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!data) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 text-center text-gray-500">
          <p>No structured data available yet.</p>
          <p className="text-sm mt-1">Complete your conversation to see results.</p>
        </div>
      </div>
    );
  }

  // Show data
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <JsonVisualizer data={data} />
    </div>
  );
};

export default StructuredOutputViewer;