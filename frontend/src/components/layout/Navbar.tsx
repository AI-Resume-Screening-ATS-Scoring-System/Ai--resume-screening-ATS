import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Upload, Server } from 'lucide-react';

interface NavbarProps {
  sidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarCollapsed }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 transition-all duration-300 glass-panel border-b border-slate-800/80 px-6 flex items-center justify-between ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <form onSubmit={(e) => { e.preventDefault(); navigate(`/ranking?query=${searchQuery}`); }} className="relative w-72 md:w-96">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search candidate name, domain, or skills..."
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
        />
      </form>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <Server className="w-3.5 h-3.5" />
          <span>Backend Connected</span>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl shadow-glow transition-all active:scale-95"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Upload Resume</span>
        </button>
      </div>
    </header>
  );
};
