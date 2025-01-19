import React from 'react';

interface TicketingTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'incoming', label: 'Incoming' },
  { id: 'my-tickets', label: 'My Tickets' },
  { id: 'team-tickets', label: 'Created by my Team' },
  { id: 'assigned-team', label: 'Assigned to my Team' },
  { id: 'create', label: 'Create New Ticket' }
] as const;

export function TicketingTabs({ activeTab, onTabChange }: TicketingTabsProps) {
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