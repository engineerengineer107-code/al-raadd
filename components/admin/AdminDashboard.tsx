import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import UserManagement from './UserManagement';
import PaymentMethodManagement from './PaymentMethodManagement';
import TransactionReview from './TransactionReview';
import PlatformSettings from './PlatformSettings';
import { UsersIcon, PaymentIcon, TransactionsIcon, SettingsIcon } from '../common/icons';

type View = 'users' | 'payments' | 'transactions' | 'settings';

const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<View>('users');
  const { user, logout } = useApp();

  // FIX: Changed component props typing to use React.FC to resolve typing issue with children.
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

  const renderView = () => {
    switch (view) {
      case 'users':
        return <UserManagement />;
      case 'payments':
        return <PaymentMethodManagement />;
      case 'transactions':
        return <TransactionReview />;
      case 'settings':
        return <PlatformSettings />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="flex h-full bg-gray-900 text-gray-100">
      <aside className="w-20 lg:w-64 bg-gray-800 p-4 flex flex-col justify-between">
        <div>
          <div className="text-white text-2xl font-bold mb-10 hidden lg:block">لوحة التحكم</div>
          <div className="text-white text-2xl font-bold mb-10 lg:hidden text-center">A</div>

          <nav className="space-y-2">
            <NavItem active={view === 'users'} onClick={() => setView('users')}>
              <UsersIcon />
              <span className="hidden lg:inline">إدارة المستخدمين</span>
            </NavItem>
            <NavItem active={view === 'payments'} onClick={() => setView('payments')}>
              <PaymentIcon />
              <span className="hidden lg:inline">طرق التحويل</span>
            </NavItem>
            <NavItem active={view === 'transactions'} onClick={() => setView('transactions')}>
              <TransactionsIcon />
              <span className="hidden lg:inline">مراجعة المعاملات</span>
            </NavItem>
             <NavItem active={view === 'settings'} onClick={() => setView('settings')}>
              <SettingsIcon />
              <span className="hidden lg:inline">إعدادات المنصة</span>
            </NavItem>
          </nav>
        </div>

        {/* User info and logout moved to top nav bar */}

      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default AdminDashboard;