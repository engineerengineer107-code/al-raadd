import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Auth from './components/Auth';
import ClientDashboard from './components/client/ClientDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import { LogoutIcon, BitcoinLogo } from './components/common/icons';

// PERFORMANCE: Moved NavLink outside of AppContainer to prevent re-declaration on every render.
const NavLink: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
      active
        ? 'bg-gray-900 text-amber-400' // Active state
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {children}
  </button>
);

const AppContainer = () => {
  const { user, logout } = useApp();

  if (!user) {
    return <Auth />;
  }

  // Initialize view based on user role. An admin can switch, a client is locked.
  const [view, setView] = useState<'client' | 'admin'>(user.role);
  
  // When user changes (e.g., logs in as a different user), reset the view
  useEffect(() => {
    setView(user.role);
  }, [user]);


  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <nav className="bg-gray-800 shadow-lg z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3 text-white font-bold text-xl">
                <BitcoinLogo />
                <span>الرائد للتداول الامن</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink active={view === 'client'} onClick={() => setView('client')}>لوحة العميل</NavLink>
                  {user.role === 'admin' && <NavLink active={view === 'admin'} onClick={() => setView('admin')}>لوحة التحكم</NavLink>}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-4 text-sm hidden sm:block">{user.email}</span>
              <button
                onClick={logout}
                title="تسجيل الخروج"
                className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-red-600/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                <LogoutIcon />
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="flex-grow overflow-hidden">
        { (view === 'admin' && user.role === 'admin') ? <AdminDashboard /> : <ClientDashboard /> }
      </div>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContainer />
    </AppProvider>
  );
};

export default App;
