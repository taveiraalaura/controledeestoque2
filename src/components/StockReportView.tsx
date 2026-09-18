import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Printer,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  ArrowRightLeft,
  DollarSign,
  PackageCheck,
  Package
} from 'lucide-react';
import { Material } from '../types.ts';
import { formatCurrency } from '../lib/api.ts';

interface StockReportViewProps {
  materials: Material[];
  loading: boolean;
  onOpenNewMaterial: () => void;
  onEditMaterial: (material: Material) => void;
  onOpenMovementForMaterial: (material: Material) => void;
  onOpenPrintReport: (filteredMaterials: Material[], categoryFilter?: string) => void;
}

export const StockReportView: React.FC<StockReportViewProps> = ({
  materials,
  loading,
  onOpenNewMaterial,
  onEditMaterial,
  onOpenMovementForMaterial,
  onOpenPrintReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'NORMAL' | 'LOW' | 'CRITICAL'>('TODOS');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    materials.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set).sort();
  }, [materials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      // Category match
      if (selectedCategory !== 'TODAS' && m.category !== selectedCategory) {
        return false;
      }

      // Status match
      if (statusFilter !== 'TODOS') {
        const isCritical = m.current_quantity === 0;
        const isLow = m.current_quantity <= m.min_quantity && !isCritical;
        const isNormal = !isCritical && !isLow;

        if (statusFilter === 'CRITICAL' && !isCritical) return false;
        if (statusFilter === 'LOW' && !isLow) return false;
        if (statusFilter === 'NORMAL' && !isNormal) return false;
      }

      // Search match
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const codeMatch = m.code.toLowerCase().includes(q);
        const descMatch = m.description.toLowerCase().includes(q);
        const locMatch = m.location?.toLowerCase().includes(q);
        if (!codeMatch && !descMatch && !locMatch) return false;
      }

      return true;
    });
  }, [materials, selectedCategory, statusFilter, searchTerm]);

  // Aggregate metrics for filtered view
  const summary = useMemo(() => {
    let totalVal = 0;
    let totalUnits = 0;
    let critical = 0;
    let low = 0;

    filteredMaterials.forEach((m) => {
      const v = m.total_value || (m.current_quantity * m.unit_price);
      totalVal += v;
      totalUnits += m.current_quantity;
      if (m.current_quantity === 0) critical++;
      else if (m.current_quantity <= m.min_quantity) low++;
    });

    return { totalVal, totalUnits, critical, low };
  }, [filteredMaterials]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <span>Relatório de Posição de Estoque</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visão consolidada de inventário com saldos atuais, status de reposição e avaliação patrimonial
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Print Button */}
          <button
            id="btn-open-stock-print"
            onClick={() => onOpenPrintReport(filteredMaterials, selectedCategory !== 'TODAS' ? selectedCategory : undefined)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir Posição (PDF)</span>
          </button>

          {/* New Material Button */}
          <button
            id="btn-open-new-material"
            onClick={onOpenNewMaterial}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Material</span>
          </button>
        </div>
      </div>

      {/* Summary Mini Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Itens Listados</span>
          <p className="text-lg font-bold text-white mt-0.5 font-mono">{filteredMaterials.length} materiais</p>
          <span className="text-[11px] text-slate-400">{summary.totalUnits} unidades totais</span>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Valor em Estoque</span>
          <p className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">{formatCurrency(summary.totalVal)}</p>
          <span className="text-[11px] text-slate-400">Saldo patrimonial atual</span>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Estoque Baixo</span>
          <p className="text-lg font-bold text-amber-400 mt-0.5 font-mono">{summary.low} itens</p>
          <span className="text-[11px] text-slate-400">Abaixo da margem de segurança</span>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Estoque Crítico</span>
          <p className="text-lg font-bold text-rose-400 mt-0.5 font-mono">{summary.critical} itens</p>
          <span className="text-[11px] text-slate-400">Totalmente zerados</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-search-stock"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código SKU, descrição ou localização..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder:text-slate-500 focus:border-amber-500 outline-none transition"
          />
        </div>

        {/* Category & Status Filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="select-filter-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm border border-slate-700 rounded-lg outline-none bg-slate-950 font-medium text-slate-200 focus:border-amber-500"
          >
            <option value="TODAS">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            id="select-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs sm:text-sm border border-slate-700 rounded-lg outline-none bg-slate-950 font-medium text-slate-200 focus:border-amber-500"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="NORMAL">🟢 Estoque Normal</option>
            <option value="LOW">🟡 Estoque Baixo</option>
            <option value="CRITICAL">🔴 Crítico / Zerado</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                <th className="py-3 px-4">Código / SKU</th>
                <th className="py-3 px-4">Descrição do Material</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-2 text-center">UN</th>
                <th className="py-3 px-3 text-right">Est. Atual</th>
                <th className="py-3 px-3 text-right">Est. Mín</th>
                <th className="py-3 px-3 text-right">Valor Unit.</th>
                <th className="py-3 px-3 text-right">Valor Total</th>
                <th className="py-3 px-3">Localização</th>
                <th className="py-3 px-3 text-center">Situação</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Carregando posição de estoque...
                  </td>
                </tr>
              ) : filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400">
                    Nenhum material encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((m) => {
                  const val = m.total_value || (m.current_quantity * m.unit_price);
                  const isCritical = m.current_quantity === 0;
                  const isLow = m.current_quantity <= m.min_quantity && !isCritical;

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {m.code}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">
                          {m.description}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 text-[11px]">
                          {m.category}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center text-slate-400 font-mono">
                        {m.unit}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-white">
                        <span className={isCritical ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}>
                          {m.current_quantity}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        {m.min_quantity}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        {formatCurrency(m.unit_price)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-100">
                        {formatCurrency(val)}
                      </td>

                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {m.location || '-'}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300">
                            Crítico (0)
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                            Estoque Baixo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                            Normal
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenMovementForMaterial(m)}
                            title="Lançar Entrada ou Saída"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors cursor-pointer"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEditMaterial(m)}
                            title="Editar Material"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
