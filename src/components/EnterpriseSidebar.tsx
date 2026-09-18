import React from 'react';
import {
  LayoutDashboard,
  Package,
  Building2,
  ArrowLeftRight,
  ClipboardList,
  FileText,
  BookOpen,
  Award,
  CheckCircle2
} from 'lucide-react';

export type AppModule =
  | 'kpis'
  | 'materials'
  | 'sectors'
  | 'movements'
  | 'requisitions'
  | 'reports'
  | 'best_practices';

interface EnterpriseSidebarProps {
  activeModule: AppModule;
  setActiveModule: (mod: AppModule) => void;
  onOpenBestPractices: () => void;
  pendingRequisitionsCount?: number;
  lowStockCount?: number;
}

export const EnterpriseSidebar: React.FC<EnterpriseSidebarProps> = ({
  activeModule,
  setActiveModule,
  onOpenBestPractices,
  pendingRequisitionsCount = 0,
  lowStockCount = 0
}) => {
  const menuItems = [
    {
      id: 'kpis' as AppModule,
      label: 'Dashboard Indicadores',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'materials' as AppModule,
      label: 'Gestão de Materiais',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} alertas` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'sectors' as AppModule,
      label: 'Gestão de Setores',
      icon: Building2,
      badge: null
    },
    {
      id: 'movements' as AppModule,
      label: 'Movimentações',
      icon: ArrowLeftRight,
      badge: null
    },
    {
      id: 'requisitions' as AppModule,
      label: 'Requisições de Material',
      icon: ClipboardList,
      badge: pendingRequisitionsCount > 0 ? `${pendingRequisitionsCount} pend.` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'reports' as AppModule,
      label: 'Relatórios de Posição',
      icon: FileText,
      badge: 'PDF',
      badgeColor: 'bg-amber-500 text-slate-950 font-bold'
    },
    {
      id: 'best_practices' as AppModule,
      label: 'Boas Práticas de Estoque',
      icon: BookOpen,
      badge: 'Guia',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    }
  ];

  return (
    <aside
      id="enterprise-sidebar"
      className="w-64 shrink-0 bg-[#0B0F19] border-r border-slate-800/80 flex flex-col justify-between p-3.5 no-print select-none min-h-[calc(100vh-65px)]"
    >
      <div>
        <div className="px-3 py-1.5 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Módulos do Sistema
          </p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  if (item.id === 'best_practices') {
                    onOpenBestPractices();
                  } else {
                    setActiveModule(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Technical Responsible Card */}
      <div className="mt-6 pt-3 border-t border-slate-800/70">
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Responsável Técnico
              </span>
              <p className="text-sm font-bold text-white mt-1">Laura Taveira</p>
              <p className="text-[11px] text-slate-400 font-medium">
                Arquiteto Full-Stack & Gestão
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Almoxarifado Ativo
            </span>
            <span className="text-slate-400 font-mono font-medium">v2.4</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
