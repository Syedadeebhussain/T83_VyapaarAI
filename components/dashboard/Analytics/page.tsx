'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
          Analytics
        </h1>
        <p className="text-gray-600 mt-1">
          View detailed insights and analytics
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analytics Module
        </h2>
        <p className="text-gray-600">
          This section will display comprehensive analytics, charts, and business insights.
        </p>
      </div>
    </div>
  );
}


