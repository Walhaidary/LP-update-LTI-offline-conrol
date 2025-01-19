import React, { useState } from 'react';
import { AdminTabs } from '../components/admin/AdminTabs';
import { UserRegistration } from '../components/admin/UserRegistration';
import { DepartmentManager } from '../components/admin/DepartmentManager';
import { CategoryManager } from '../components/admin/CategoryManager';
import { KPIManager } from '../components/admin/KPIManager';
import { StatusManager } from '../components/admin/StatusManager';
import { ServiceProviderManager } from '../components/admin/ServiceProviderManager';
import { PerformanceReport } from '../components/reports/PerformanceReport';
import { KPIWatch } from '../components/reports/KPIWatch';
import type { UserProfile } from '../lib/auth';

interface AdminPageProps {
  user: UserProfile;
  onLogout: () => void;
}

export function AdminPage({ user, onLogout }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState('performance');

  const renderContent = () => {
    switch (activeTab) {
      case 'performance':
        return <PerformanceReport />;
      case 'kpi-watch':
        return <KPIWatch />;
      case 'trucks-ov':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium mb-4">Active Trucks</h3>
              <p className="text-3xl font-bold text-primary">24</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium mb-4">Loading Progress</h3>
              <p className="text-3xl font-bold text-green-600">85%</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium mb-4">Pending Approvals</h3>
              <p className="text-3xl font-bold text-amber-500">7</p>
            </div>
          </div>
        );
      case 'users':
        return <UserRegistration />;
      case 'departments':
        return <DepartmentManager />;
      case 'categories':
        return <CategoryManager />;
      case 'kpis':
        return <KPIManager />;
      case 'status':
        return <StatusManager />;
      case 'service-providers':
        return <ServiceProviderManager />;
      default:
        return <PerformanceReport />;
    }
  };

  return (
    <>
      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 p-8 bg-gray-50">
        {renderContent()}
      </div>
    </>
  );
}