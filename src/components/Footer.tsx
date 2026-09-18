import React from 'react';
import { ShieldCheck, Database, Calendar } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="main-footer" className="mt-auto border-t border-slate-800/80 bg-[#0B0F19] py-3.5 px-4 sm:px-6 no-print">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        
        {/* Left: System Info */}
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-200">ESTOQUEPRO Enterprise</span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline text-slate-400">Gestão Integrada de Estoque e Almoxarifado</span>
        </div>

        {/* Center / Highlight: Mandatory Responsável Técnico */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 font-semibold text-xs shadow-xs">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span className="tracking-wide">Laura Taveira - Responsável Técnico</span>
        </div>

        {/* Right: Date / Version */}
        <div className="flex items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Ano Base {currentYear}</span>
          </div>
          <span className="text-slate-700">•</span>
          <span className="bg-slate-800/80 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono font-medium">v2.4</span>
        </div>

      </div>
    </footer>
  );
};
