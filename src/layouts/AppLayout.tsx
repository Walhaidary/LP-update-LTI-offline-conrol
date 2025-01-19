import React from 'react';
import { Section1 } from '../pages/Section1';
import { Section2 } from '../pages/Section2';
import { Section3 } from '../pages/Section3';
import { Section4 } from '../pages/Section4';
import { TicketingPage } from '../pages/TicketingPage';
import { AdminPage } from '../pages/AdminPage';
import { ServiceProvidersPage } from '../pages/ServiceProvidersPage';
import { RestrictedAccess } from '../components/common/RestrictedAccess';
import { Navbar } from '../components/layout/Navbar';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import type { UserProfile } from '../lib/auth';

interface AppLayoutProps {
  user: UserProfile;
  onLogout: () => void;
}

export function AppLayout({ user, onLogout }: AppLayoutProps) {
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const renderContent = () => {
    const currentLevel = user.access_level;

    // Service Provider (Level 0) can only access ticketing and service providers
    if (currentLevel === 0) {
      if (currentPath.startsWith('/ticketing')) {
        return <TicketingPage user={user} onLogout={onLogout} />;
      }
      if (currentPath === '/service-providers') {
        return <ServiceProvidersPage user={user} onLogout={onLogout} />;
      }
      return <RestrictedAccess />;
    }

    // For other access levels, check permissions as before
    if (currentPath.startsWith('/ticketing')) {
      return currentLevel >= 2 ? <TicketingPage user={user} onLogout={onLogout} /> : <RestrictedAccess />;
    }

    switch (currentPath) {
      case '/monitors':
        return currentLevel >= 1 ? <Section1 user={user} onLogout={onLogout} /> : <RestrictedAccess />;
      case '/service-providers':
        return currentLevel >= 1 ? <ServiceProvidersPage user={user} onLogout={onLogout} /> : <RestrictedAccess />;
      case '/manage-sc':
        return currentLevel >= 2 ? <Section2 user={user} onLogout={onLogout} /> : <RestrictedAccess />;
      case '/store-keeper':
        return currentLevel >= 3 ? <Section3 user={user} onLogout={onLogout} /> : <RestrictedAccess />;
      case '/wh-manager':
        return currentLevel >= 4 ? <Section4 user={user} onLogout={onLogout} /> : <RestrictedAccess />;
      case '/admin':
        return currentLevel >= 5 ? <AdminPage user={user} onLogout={onLogout} /> : <RestrictedAccess />;
      default:
        // For Level 0, default to service providers page
        if (currentLevel === 0) {
          return <ServiceProvidersPage user={user} onLogout={onLogout} />;
        }
        // For other levels, default to monitors page
        return currentLevel >= 1 ? <Section1 user={user} onLogout={onLogout} /> : <RestrictedAccess />;
    }
  };

  // Get section name for breadcrumb
  const getSectionName = () => {
    if (currentPath.startsWith('/ticketing')) return 'Ticketing';
    
    switch (currentPath) {
      case '/monitors': return 'Monitors';
      case '/service-providers': return 'Service Providers';
      case '/manage-sc': return 'Manage SC';
      case '/store-keeper': return 'Store Keeper';
      case '/wh-manager': return 'WH Manager';
      case '/admin': return 'Admin';
      default: return 'Service Providers';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={onLogout} />
      <Breadcrumb section={getSectionName()} />
      {renderContent()}
    </div>
  );
}