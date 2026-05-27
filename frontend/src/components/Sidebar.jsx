import React, { useContext, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LayoutDashboard, Home, LogOut, Menu, X, Landmark, Send, CreditCard, Sun, Moon } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Helper to determine if a URL parameter query is active
  const isTabActive = (tabName) => {
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab') || 'overview';
    return location.pathname === '/dashboard' && currentTab === tabName;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-850 text-bank-secondary dark:text-slate-200 hover:text-bank-accent focus:outline-none transition-colors"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm md:hidden"
        ></div>
      )}

      {/* Sidebar Layout */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col w-64 bg-bank-secondary text-white border-r border-slate-800 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand/Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-bank-accent/10 border border-bank-accent/30">
            <Landmark className="h-6 w-6 text-bank-accent" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight leading-tight">DoxBank</h1>
            <span className="text-[10px] block font-medium uppercase tracking-widest text-slate-400">Of India</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {/* External Home Link */}
          <NavLink
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all duration-200 group"
          >
            <Home size={18} className="transition-transform group-hover:scale-110" />
            <span>Home</span>
          </NavLink>

          <div className="border-t border-slate-800/50 my-4 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-4 mb-2">Banking Actions</p>
            
            {/* Overview Tab */}
            <button
              onClick={() => {
                navigate('/dashboard?tab=overview');
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
                isTabActive('overview')
                  ? 'bg-bank-accent text-white shadow-lg shadow-bank-accent/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <LayoutDashboard size={18} className="transition-transform group-hover:scale-110" />
              <span>Overview</span>
            </button>

            {/* Fund Transfers Tab */}
            <button
              onClick={() => {
                navigate('/dashboard?tab=transfers');
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
                isTabActive('transfers')
                  ? 'bg-bank-accent text-white shadow-lg shadow-bank-accent/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Send size={18} className="transition-transform group-hover:scale-110" />
              <span>Send Money</span>
            </button>

            {/* Card Security Tab */}
            <button
              onClick={() => {
                navigate('/dashboard?tab=card');
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
                isTabActive('card')
                  ? 'bg-bank-accent text-white shadow-lg shadow-bank-accent/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <CreditCard size={18} className="transition-transform group-hover:scale-110" />
              <span>Card Security</span>
            </button>
          </div>
        </nav>

        {/* Theme and profile footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 space-y-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-medium text-sm text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              <span>Theme Toggle</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
              {theme}
            </span>
          </button>

          {user && (
            <div className="flex items-center gap-3 px-2 py-2 border-t border-slate-800/50 pt-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 text-bank-accent font-semibold shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate text-slate-200">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200 cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
