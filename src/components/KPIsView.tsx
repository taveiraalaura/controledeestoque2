import React from 'react';
import {
  Boxes,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Package,
  Layers,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import { StockKPIs } from '../types.ts';
import { formatCurrency } from '../lib/api.ts';

interface KPIsViewProps {
  kpis: StockKPIs | null;
  loading: boolean;
  onRefresh: () => void;
  onNavigateToStock: () => void;
  onNavigateToMovements: () => void;
}

export const KPIsView: React.FC<KPIsViewProps> = ({
  kpis,
  loading,
  onRefresh,
  onNavigateToStock,
  onNavigateToMovements,
}) => {
  if (loading || !kpis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-200">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400">Calculando indicadores de desempenho do almoxarifado...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Section: Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-400" />
            Indicadores de Desempenho do Almoxarifado
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Painel gerencial de controle patrimonial, rotatividade e fluxo de materiais
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Atualizar Indicadores</span>
        </button>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Valor Total em Estoque
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white font-mono">
              {formatCurrency(kpis.totalStockValue)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <span>Patrimônio imobilizado em materiais</span>
          </div>
        </div>

        {/* Total Items (SKUs & Physical Units) */}
        <div
          className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-sm hover:border-slate-700 transition-colors cursor-pointer group"
          onClick={onNavigateToStock}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Itens Cadastrados (SKUs)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{kpis.totalSkus}</span>
            <span className="text-xs text-slate-400 font-medium">tipos de material</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <Package className="w-3.5 h-3.5 text-slate-500" />
            <span>Total de {kpis.totalPhysicalUnits} unidades físicas</span>
          </div>
        </div>

        {/* Period Movements */}
        <div
          className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-sm hover:border-slate-700 transition-colors cursor-pointer group"
          onClick={onNavigateToMovements}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Movimentações no Período
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{kpis.totalMovementsCount}</span>
            <span className="text-xs text-slate-400 font-medium">registros efetuados</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ArrowDownRight className="w-3.5 h-3.5" /> {kpis.periodEntriesCount} Entradas
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> {kpis.periodExitsCount} Saídas
            </span>
          </div>
        </div>

        {/* Turnover Rate (Taxa de Rotatividade) */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Taxa de Rotatividade (Giro)
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{kpis.turnoverRate}x</span>
            <span className="text-xs text-slate-400 font-medium">no período</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <span>Saídas: {formatCurrency(kpis.periodExitsValue)}</span>
          </div>
        </div>
      </div>

      {/* Stock Health Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Critical Stock Alert */}
        <div className="bg-rose-950/30 border border-rose-900/60 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-200">
                {kpis.criticalStockCount} {kpis.criticalStockCount === 1 ? 'Item com Estoque Zerado' : 'Itens com Estoque Zerado'}
              </h3>
              <p className="text-xs text-rose-300/80">
                Materiais sem disponibilidade imediata no almoxarifado (ruptura de estoque).
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToStock}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            Verificar Itens
          </button>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-amber-950/30 border border-amber-900/60 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-200">
                {kpis.lowStockCount} {kpis.lowStockCount === 1 ? 'Item em Nível Mínimo' : 'Itens em Nível Mínimo'}
              </h3>
              <p className="text-xs text-amber-300/80">
                Estoque atual igual ou inferior ao ponto de reposição de segurança programado.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToStock}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            Emitir Reposição
          </button>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Distribuição de Valor por Categoria
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {kpis.categories.length} categorias
            </span>
          </div>

          <div className="space-y-3.5">
            {kpis.categories.map((cat) => {
              const percentage = kpis.totalStockValue > 0 
                ? Math.round((cat.totalValue / kpis.totalStockValue) * 100) 
                : 0;

              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">{cat.count} itens</span>
                      <span className="font-bold text-white font-mono">{formatCurrency(cat.totalValue)}</span>
                      <span className="text-amber-400 font-semibold w-8 text-right font-mono">{percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Exit Materials */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Materiais com Maior Saída / Giro
              </h3>
            </div>
            <span className="text-xs text-slate-400">Volume Requisitado</span>
          </div>

          {kpis.topMaterials && kpis.topMaterials.length > 0 ? (
            <div className="divide-y divide-slate-800/80">
              {kpis.topMaterials.map((mat, idx) => (
                <div key={mat.material_id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-200 leading-tight">
                        {mat.description}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {mat.code}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400 block font-mono">
                      {mat.totalExits} {mat.unit}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatCurrency(mat.totalValue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              Nenhuma movimentação de saída registrada até o momento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
