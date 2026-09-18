import React, { useState } from 'react';
import {
  Package,
  BookOpen,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { User } from '../types.ts';

interface EnterpriseHeaderProps {
  currentUser: User;
  onLogout: () => void;
  onOpenBestPractices: () => void;
  onResetDemo: () => Promise<void>;
  resettingDemo: boolean;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const EnterpriseHeader: React.FC<EnterpriseHeaderProps> = ({
  currentUser,
  onLogout,
  onOpenBestPractices,
  onResetDemo,
  resettingDemo,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header
      id="enterprise-header"
      className="bg-[#0B0F19] border-b border-slate-800/90 sticky top-0 z-40 px-4 sm:px-6 py-3 no-print"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Brand & App Title */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu button */}
          {setMobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {/* Amber Box Logo */}
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
            <Package className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white">
                ESTOQUE<span className="text-amber-400">PRO</span>
              </span>
              <span className="bg-blue-900/60 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-700/50 uppercase tracking-wider">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Gestão Integrada de Estoque e Almoxarifado
            </p>
          </div>
        </div>

        {/* Action Buttons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Boas Práticas Button */}
          <button
            id="btn-boas-praticas"
            onClick={onOpenBestPractices}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 transition cursor-pointer shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Boas Práticas</span>
          </button>

          {/* Dados Demo Button */}
          <button
            id="btn-dados-demo"
            onClick={onResetDemo}
            disabled={resettingDemo}
            title="Recarregar base de dados de demonstração"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-400 ${resettingDemo ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">
              {resettingDemo ? 'Recarregando...' : 'Dados Demo'}
            </span>
          </button>

          {/* User Profile Badge */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-full transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {currentUser.name.charAt(0) || 'L'}
              </div>

              <div className="text-left hidden md:block leading-tight">
                <p className="text-xs font-bold text-white leading-none">
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-extrabold text-amber-400 tracking-wider uppercase mt-0.5">
                  GESTOR
                </p>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="font-bold text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400">{currentUser.role}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenBestPractices();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    Guia de Boas Práticas
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Encerrar Sessão / Trocar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
