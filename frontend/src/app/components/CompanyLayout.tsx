import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Briefcase, LayoutDashboard, Plus, User, LogOut } from 'lucide-react';
import { logout } from '../api';

export function CompanyLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="size-full flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/company/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">IntriVue</h1>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-2">
              {[
                { to: '/company/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
                { to: '/company/create-job', icon: <Plus className="w-5 h-5" />, label: 'Post Job' },
                { to: '/company/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPath === to
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                  {icon}{label}
                </Link>
              ))}
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-all">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <p>&copy; 2026 IntriVue. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
