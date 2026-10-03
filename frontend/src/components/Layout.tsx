import { NavLink, Outlet } from 'react-router-dom';
import { Shield, LayoutDashboard, FileSearch, Upload, Bell, Search } from 'lucide-react';
import { ToastContainer } from './ToastContainer';

const NAV_ITEMS = [
  { to: '/', icon: Upload, label: 'Scan' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/findings', icon: FileSearch, label: 'Findings' },
];

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-[72px] bg-white border-r border-gray-100 flex flex-col items-center py-6 gap-2 shrink-0">
        {/* Logo */}
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
          <Shield className="w-5 h-5 text-white" />
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200
                 ${isActive
                   ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                   : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                 }`
              }
            >
              <Icon className="w-5 h-5" />
              {/* Tooltip */}
              <span className="absolute left-16 bg-gray-900 text-white text-xs px-2.5 py-1 rounded-lg
                               opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                               whitespace-nowrap shadow-lg z-50">
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">InfraGuard<span className="text-indigo-500"> AI</span></h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search…"
                className="w-56 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                           transition-colors placeholder:text-gray-400"
              />
            </div>
            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">IG</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
