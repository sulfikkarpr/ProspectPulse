import { ReactNode } from 'react';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-600">ProspectPulse</h1>
              </div>
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
            <div className="flex items-center space-x-4">
              {user?.role === 'admin' && !adminKeyVerified && (
                <AdminKeyUnlock />
              )}
              <span className="text-sm text-gray-700">{user?.name}</span>
              {user?.role === 'admin' && adminKeyVerified && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                  Admin
                </span>
              )}
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

