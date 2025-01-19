import React, { useState } from 'react';
import { TicketingTabs } from '../components/ticketing/TicketingTabs';
import { TicketWizard } from '../components/ticketing/wizard/TicketWizard';
import { MyTickets } from '../components/ticketing/MyTickets';
import { TeamTickets } from '../components/ticketing/TeamTickets';
import { AssignedTeamTickets } from '../components/ticketing/AssignedTeamTickets';
import { IncomingTickets } from '../components/ticketing/IncomingTickets';
import { TicketDetails } from '../components/ticketing/TicketDetails';
import type { UserProfile } from '../lib/auth';

interface TicketingPageProps {
  user: UserProfile;
  onLogout: () => void;
}

export function TicketingPage({ user, onLogout }: TicketingPageProps) {
  const [activeTab, setActiveTab] = useState('incoming');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  React.useEffect(() => {
    // Handle browser navigation
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const match = path.match(/\/ticketing\/ticket\/(.+)/);
      if (match) {
        setSelectedTicket(match[1]);
      } else {
        setSelectedTicket(null);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange(); // Check initial URL

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleBack = () => {
    window.history.pushState({}, '', '/ticketing');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const renderContent = () => {
    if (selectedTicket) {
      return (
        <div className="p-6">
          <TicketDetails ticketNumber={selectedTicket} onBack={handleBack} />
        </div>
      );
    }

    switch (activeTab) {
      case 'incoming':
        return <IncomingTickets />;
      case 'my-tickets':
        return <MyTickets />;
      case 'team-tickets':
        return <TeamTickets />;
      case 'assigned-team':
        return <AssignedTeamTickets />;
      case 'create':
        return (
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Create New Ticket</h2>
            <TicketWizard />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Ticketing System</h1>
      <div className="bg-white rounded-lg shadow-sm border">
        {!selectedTicket && <TicketingTabs activeTab={activeTab} onTabChange={setActiveTab} />}
        {renderContent()}
      </div>
    </div>
  );
}