import React from 'react';

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'performance', label: 'Performance' },
  { id: 'kpi-watch', label: 'KPI Watch' },
  { id: 'trucks-ov', label: 'Trucks OV' },
  { id: 'users', label: 'Register Users' },
  { id: 'departments', label: 'Departments' },
  { id: 'categories', label: 'Categories' },
  { id: 'kpis', label: 'KPIs' },
  { id: 'status', label: 'Status' },
  { id: 'service-providers', label: 'Service Providers' }
] as const;

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-4 px-6" aria-label="Tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm
              ${activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}