import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  className,
}) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-md p-6 border border-gray-200', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={cn('text-sm mt-2', trendUp ? 'text-green-600' : 'text-red-600')}>
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="ml-4 p-3 bg-blue-50 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
};
