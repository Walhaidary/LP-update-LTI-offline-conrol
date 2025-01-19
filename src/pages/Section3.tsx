import React, { useState } from 'react';
import { StorekeeperTabs } from '../components/layout/StorekeeperTabs';
import { TrucksStatusReport } from '../components/reports/TrucksStatusReport';
import { DeliveredTrucks } from '../components/reports/DeliveredTrucks';
import { LTISTOList } from '../components/lti-sto/LTISTOList';
import { LTISTOReport } from '../components/lti-sto/LTISTOReport';
import { OBDWaybillList } from '../components/obd-waybill/OBDWaybillList';
import { LOReport } from '../components/lo-report/LOReport';
import type { UserProfile } from '../lib/auth';

interface Section3Props {
  user: UserProfile;
  onLogout: () => void;
}

export function Section3({ user, onLogout }: Section3Props) {
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
      case 'lti-sto-list':
        return <LTISTOList />;
      case 'lti-sto-report':
        return (
          <>
            <h1 className="text-2xl font-bold mb-6">LTI/STO Report</h1>
            <LTISTOReport />
          </>
        );
      case 'obd-waybill-list':
        return <OBDWaybillList />;
      case 'lo-report':
        return <LOReport />;
      default:
        return null;
    }
  };

  return (
    <>
      <StorekeeperTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 p-8 bg-gray-50">
        {renderContent()}
      </div>
    </>
  );
}