import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import TradingView from './TradingView';
import Wallet from './Wallet';
import MarketView from './MarketView';
import { LogoutIcon, TradingIcon, WalletIcon, MarketIcon } from '../common/icons';

type View = 'market' | 'trading' | 'wallet';

// PERFORMANCE: Moved NavItem outside of ClientDashboard to prevent re-declaration on every render.
const NavItem: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
      active ? 'bg-amber-500 text-black font-semibold' : 'hover:bg-gray-700 text-gray-300'
    }`}
  >
    {children}
  </button>
);

const ClientDashboard: React.FC = () => {
  const [view, setView] = useState<View>('market');
  const { user, logout } = useApp();

  return (
    <div className="flex h-full bg-gray-900 text-gray-100">
      <aside className="w-20 lg:w-64 bg-gray-800 p-4 flex flex-col justify-between">
        <div>
          <div className="text-white text-2xl font-bold mb-10 hidden lg:block">منصة التداول</div>
          <div className="text-white text-2xl font-bold mb-10 lg:hidden text-center">T</div>

          <nav className="space-y-2">
             <NavItem active={view === 'market'} onClick={() => setView('market')}>
              <MarketIcon />
              <span className="hidden lg:inline">السوق</span>
            </NavItem>
            <NavItem active={view === 'trading'} onClick={() => setView('trading')}>
              <TradingIcon />
              <span className="hidden lg:inline">التداول</span>
            </NavItem>
            <NavItem active={view === 'wallet'} onClick={() => setView('wallet')}>
              <WalletIcon />
              <span className="hidden lg:inline">المعاملات</span>
            </NavItem>
          </nav>
        </div>

        {/* User info and logout moved to top nav bar */}
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {view === 'market' && <MarketView />}
        {view === 'trading' && <TradingView />}
        {view === 'wallet' && <Wallet />}
      </main>
    </div>
  );
};

export default ClientDashboard;