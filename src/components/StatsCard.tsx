import type { LucideProps } from 'lucide-react';
import { type ComponentType } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ComponentType<LucideProps>;
  color?: string;
}

export default function StatsCard({ title, value, change, icon: Icon, color = 'primary' }: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-primary-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">{change}</p>
          )}
        </div>
        <div className={`${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary} p-3 rounded-lg`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}

