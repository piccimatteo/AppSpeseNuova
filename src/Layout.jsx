import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Target,
  Menu,
  X,
  Wallet,
  Settings,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Uscite", icon: Receipt, page: "Expenses" },
  { name: "Report", icon: BarChart3, page: "Reports" },
  { name: "Obiettivi", icon: Target, page: "Goals" },
  { name: "Impostazioni", icon: Settings, page: "Settings" },
];

const rootPages = ["Dashboard", "Expenses", "Reports", "Goals", "Settings"];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isRoot = rootPages.includes(currentPageName);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex">
      <style>{`
        :root {
          --bg-primary: #0f1117;
          --bg-card: #1a1d27;
          --bg-card-hover: #22263a;
          --accent-emerald: #10b981;
          --accent-coral: #f87171;
          --accent-blue: #60a5fa;
          --accent-purple: #a78bfa;
          --accent-amber: #fbbf24;
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --border-color: #2a2f3e;
        }
        body {
          background: var(--bg-primary);
          overscroll-behavior: none;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2f3e; border-radius: 3px; }
        button, a { user-select: none; }
        svg { user-select: none; }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (desktop only) */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64
        bg-[#13151f]/95 backdrop-blur-xl border-r border-white/5
        flex flex-col transition-transform duration-300 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">MPfinTraker</h1>
            <p className="text-xs text-slate-500">Gestione Finanze</p>
          </div>
        </div>

        <nav className="flex-1 px-3 mt-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }
                `}
              >
                <item.icon className={`h-[18px] w-[18px] transition-colors ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                {item.name}
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-white/5">
          <p className="text-xs text-slate-400">La tua dashboard personale per il controllo delle finanze</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Mobile header */}
        <div
          className="lg:hidden flex items-center justify-between px-4 border-b border-white/5 sticky top-0 bg-[#0f1117]/90 backdrop-blur-xl z-30"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)", paddingBottom: "12px" }}
        >
          <div className="flex items-center gap-2">
            {!isRoot && (
              <button
                onClick={() => window.history.back()}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors mr-1"
              >
                <ChevronLeft className="h-5 w-5 text-slate-300" />
              </button>
            )}
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">MPfinTraker</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
          {children}
        </div>

        {/* Mobile Bottom Tab Bar */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#13151f]/95 backdrop-blur-xl border-t border-white/5 flex"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
                  isActive ? "text-emerald-400" : "text-slate-500"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}