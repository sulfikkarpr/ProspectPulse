import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from './Button';
import AdminKeyUnlock from './AdminKeyUnlock';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout, adminKeyVerified } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/prospects', label: 'Prospects' },
    { path: '/schedule', label: 'Schedule Pre-Talk' },
  ];

  // Add admin menu items if admin key is verified
  if (user?.role === 'admin' && adminKeyVerified) {
    navItems.push({ path: '/admin/users', label: 'User Approval' });
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-lg sm:text-xl font-bold text-blue-600">ProspectPulse</h1>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.path
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            {/* Desktop User Menu */}
            <div className="hidden sm:flex sm:items-center sm:space-x-2 sm:space-x-4">
              {user?.role === 'admin' && !adminKeyVerified && (
                <AdminKeyUnlock />
              )}
              <span className="text-sm text-gray-700 hidden md:inline">{user?.name}</span>
              {user?.role === 'admin' && adminKeyVerified && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                  Admin
                </span>
              )}
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
            {/* Mobile Menu Button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="sm:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-200">
                  <div className="px-3 py-2 text-sm text-gray-700">{user?.name}</div>
                  {user?.role === 'admin' && !adminKeyVerified && (
                    <div className="px-3 py-2">
                      <AdminKeyUnlock />
                    </div>
                  )}
                  {user?.role === 'admin' && adminKeyVerified && (
                    <div className="px-3 py-2">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        Admin
                      </span>
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={logout} className="w-full mt-2">
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

