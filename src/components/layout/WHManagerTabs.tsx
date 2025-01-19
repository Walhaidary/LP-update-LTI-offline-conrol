import React from 'react';

interface WHManagerTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs = [
  { id: 'trucks-status', label: 'Trucks Status Report' },
  { id: 'delivered-trucks', label: 'Delivered Trucks' },
  { id: 'loading-report', label: 'Offline Dispatch Report' }
] as const;

export function WHManagerTabs({ activeTab, onTabChange }: WHManagerTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-4 px-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap
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