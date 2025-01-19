import React, { useState } from 'react';
import { WHManagerTabs } from '../components/layout/WHManagerTabs';
import { TrucksStatusReport } from '../components/reports/TrucksStatusReport';
import { DeliveredTrucks } from '../components/reports/DeliveredTrucks';
import { LOReport } from '../components/lo-report/LOReport';
import type { UserProfile } from '../lib/auth';

interface Section4Props {
  user: UserProfile;
  onLogout: () => void;
}

export function Section4({ user, onLogout }: Section4Props) {
  const [activeTab, setActiveTab] = useState('trucks-status');

  const renderContent = () => {
    switch (activeTab) {
      case 'trucks-status':
        return (
          <>
            <h1 className="text-2xl font-bold mb-6">Trucks Status Report</h1>
            <TrucksStatusReport />
          </>
        );
      case 'delivered-trucks':
        return (
          <>
            <h1 className="text-2xl font-bold mb-6">Delivered Trucks</h1>
            <DeliveredTrucks />
          </>
        );
      case 'loading-report':
        return <LOReport />;
      default:
        return null;
    }
  };

  return (
    <>
      <WHManagerTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 p-8 bg-gray-50">
        {renderContent()}
      </div>
    </>
  );
}