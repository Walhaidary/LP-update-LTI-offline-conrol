import React, { useState, useEffect } from 'react';
import { MonitorTabs } from '../components/layout/MonitorTabs';
import { TruckInfoWizard } from '../components/wizard/TruckInfoWizard';
import { TrucksStatusReport } from '../components/reports/TrucksStatusReport';
import type { UserProfile } from '../lib/auth';

interface Section1Props {
  user: UserProfile;
  onLogout: () => void;
}

export function Section1({ user, onLogout }: Section1Props) {
  const [activeTab, setActiveTab] = useState('input');
  const [selectedSerialNumber, setSelectedSerialNumber] = useState<string | null>(null);

  useEffect(() => {
    // Listen for navigation events from the status report
    const handleNavigate = (e: CustomEvent<{ serialNumber: string }>) => {
      setActiveTab('input');
      setSelectedSerialNumber(e.detail.serialNumber);
    };

    window.addEventListener('navigate-to-update', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate-to-update', handleNavigate as EventListener);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'input':
        return <TruckInfoWizard initialSerialNumber={selectedSerialNumber} />;
      case 'status':
        return <TrucksStatusReport />;
      default:
        return null;
    }
  };

  return (
    <>
      <MonitorTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 p-8 bg-gray-50">
        {renderContent()}
      </div>
    </>
  );
}