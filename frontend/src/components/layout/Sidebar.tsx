import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FileSearch,
  Trophy,
  ClipboardCheck,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Upload Resume', path: '/upload', icon: UploadCloud },
    { label: 'Resume Analysis', path: '/analysis', icon: FileSearch },
    { label: 'Candidate Ranking', path: '/ranking', icon: Trophy },
    { label: 'Evaluation', path: '/evaluation', icon: ClipboardCheck },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 glass-panel border-r border-slate-800/80 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center shadow-glow shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                  Resumix<span className="text-brand-400">.ats</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  AI Resume Screening Project
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600/30 to-brand-500/10 text-brand-300 border border-brand-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate flex-1">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-800/60 space-y-3">
        {!collapsed && (
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-200">Backend Connected</p>
              <p className="text-slate-400 text-[11px]">FastAPI Ready</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
