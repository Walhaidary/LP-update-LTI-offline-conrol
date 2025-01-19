import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface StorekeeperTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: Tab[] = [
  { id: 'trucks-status', label: 'Trucks Status Report' },
  { id: 'delivered-trucks', label: 'Delivered Trucks' },
  { id: 'lti-sto-list', label: 'Create Offline LTI' },
  { id: 'lti-sto-report', label: 'LTI/STO Report' },
  { id: 'obd-waybill-list', label: 'Create Offline Waybill' },
  { id: 'lo-report', label: 'Offline Dispatch Report' }
];

export function StorekeeperTabs({ activeTab, onTabChange }: StorekeeperTabsProps) {
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