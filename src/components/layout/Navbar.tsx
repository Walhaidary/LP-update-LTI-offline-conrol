import React, { useState } from 'react';
import { UserCircle, ChevronDown, Search, Menu, X, Activity } from 'lucide-react';
import { navigationItems } from '../../config/navigation';
import type { UserProfile } from '../../lib/auth';

interface NavbarProps {
  user: UserProfile;
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setIsMenuOpen(false);
  };

  // Filter navigation items based on user access level
  const filteredNavItems = navigationItems.filter(item => {
    return user.access_level >= item.minLevel;
  });

  return (
    <nav className="bg-[#0088CC] text-white">
      <div className="px-4 md:px-6 py-3">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-8 h-8" />
            <span className="text-2xl font-bold">Logpulse</span>
          </div>
          
          <div className="flex items-center gap-6 justify-end flex-1 ml-8">
            {filteredNavItems.map((item) => (
              <NavButton 
                key={item.path}
                label={item.label} 
                onClick={() => navigate(item.path)} 
              />
            ))}
            
            <div className="relative w-[19.2%]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] w-4 h-4" />
              <input
                type="search"
                placeholder="Search"
                className="w-full pl-9 pr-3 py-1.5 rounded bg-white text-black placeholder:text-[#999999] focus:outline-none"
              />
            </div>
            
            <button 
              onClick={onLogout}
              className="flex items-center gap-1 hover:bg-[#0077B3] rounded px-2 py-1 transition-colors"
            >
              <UserCircle className="w-8 h-8" />
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6" />
            <span className="text-xl font-bold">Logpulse</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onLogout}
              className="hover:bg-[#0077B3] rounded p-1 transition-colors"
            >
              <UserCircle className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover:bg-[#0077B3] rounded p-1 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 border-t border-[#0077B3] pt-3 space-y-2">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] w-4 h-4" />
              <input
                type="search"
                placeholder="Search"
                className="w-full pl-9 pr-3 py-1.5 rounded bg-white text-black placeholder:text-[#999999] focus:outline-none"
              />
            </div>
            
            {filteredNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="block w-full text-left px-3 py-2 hover:bg-[#0077B3] rounded transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="hover:bg-[#0077B3] px-3 py-1.5 rounded transition-colors"
    >
      {label}
    </button>
  );
}