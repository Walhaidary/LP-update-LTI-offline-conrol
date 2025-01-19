import React from 'react';

interface MonitorTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MonitorTabs({ activeTab, onTabChange }: MonitorTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-4 px-6" aria-label="Tabs">
        {[
          { id: 'input', label: 'Input Trucks Info' },
          { id: 'status', label: 'Truck Status Report' }
        ].map((tab) => (
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