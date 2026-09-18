import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { Sector } from '../types.ts';
import { formatCurrency } from '../lib/api.ts';

interface SectorsViewProps {
  sectors: Sector[];
  loading: boolean;
  onRefresh: () => void;
  onSaveSector: (data: Partial<Sector>, id?: number) => Promise<void>;
  onDeleteSector: (id: number) => Promise<void>;
  onNavigateToRequisitions?: () => void;
}

export const SectorsView: React.FC<SectorsViewProps> = ({
  sectors,
  loading,
  onRefresh,
  onSaveSector,
  onDeleteSector,
  onNavigateToRequisitions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    responsible: '',
    email: '',
    phone: '',
    location: '',
    budget_limit: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredSectors = sectors.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.code.toLowerCase().includes(term) ||
      s.name.toLowerCase().includes(term) ||
      s.responsible.toLowerCase().includes(term) ||
      (s.location && s.location.toLowerCase().includes(term))
    );
  });

  const handleOpenNew = () => {
    setEditingSector(null);
    setFormData({
      code: `SET-0${sectors.length + 1}`,
      name: '',
      responsible: '',
      email: '',
      phone: '',
      location: '',
      budget_limit: 15000
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (sector: Sector) => {
    setEditingSector(sector);
    setFormData({
      code: sector.code,
      name: sector.name,
      responsible: sector.responsible,
      email: sector.email || '',
      phone: sector.phone || '',
      location: sector.location || '',
      budget_limit: sector.budget_limit || 0
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.responsible) {
      setErrorMsg('Código, nome do setor e responsável são obrigatórios.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSaveSector(formData, editingSector?.id);
      setModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar setor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sector: Sector) => {
    if (confirm(`Tem certeza que deseja excluir o setor "${sector.name}" (${sector.code})?`)) {
      try {
        await onDeleteSector(sector.id);
      } catch (err: any) {
        alert(err.message || 'Falha ao excluir setor.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-amber-400" />
            Gestão de Setores e Departamentos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastro de centros de custo, solicitantes autorizados e limites orçamentários do almoxarifado.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código, nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <button
            onClick={handleOpenNew}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Novo Setor
          </button>
        </div>
      </div>

      {/* Sectors Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Carregando setores cadastrados...</p>
        </div>
      ) : filteredSectors.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-10 text-center text-slate-400">
          <Building2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">Nenhum setor encontrado</p>
          <p className="text-xs text-slate-500 mt-1">Cadastre um novo setor para começar a gerenciar requisições departamentais.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSectors.map((sector) => (
            <div
              key={sector.id}
              className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold rounded">
                      {sector.code}
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                      Ativo
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleOpenEdit(sector)}
                      title="Editar Setor"
                      className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sector)}
                      title="Excluir Setor"
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-1 leading-snug">{sector.name}</h3>

                <div className="space-y-1.5 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-slate-300 font-medium truncate">{sector.responsible}</span>
                  </div>

                  {sector.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{sector.location}</span>
                    </div>
                  )}

                  {sector.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate text-slate-400">{sector.email}</span>
                    </div>
                  )}

                  {sector.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{sector.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Teto Orçamentário</span>
                  <span className="font-mono font-bold text-slate-200">
                    {formatCurrency(sector.budget_limit || 0)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Requisições</span>
                  <span className="text-slate-300 font-medium">
                    {sector.total_requisitions || 0} total{' '}
                    {Boolean(sector.pending_requisitions) && (
                      <span className="text-amber-400 font-bold">({sector.pending_requisitions} pend.)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Sector */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                {editingSector ? 'Editar Setor / Departamento' : 'Cadastrar Novo Setor'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Código do Setor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: SET-01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Teto Orçamentário (R$)
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={formData.budget_limit}
                    onChange={(e) => setFormData({ ...formData, budget_limit: Number(e.target.value) })}
                    placeholder="15000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nome do Setor / Departamento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Manutenção Industrial"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Responsável pelo Setor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.responsible}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  placeholder="Ex: Roberto Alves de Souza"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    E-mail Institucional
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="setor@empresa.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Telefone / Ramal
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Localização Física no Almoxarifado / Fábrica
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Galpão Norte - Ala B"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : editingSector ? 'Salvar Alterações' : 'Cadastrar Setor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
