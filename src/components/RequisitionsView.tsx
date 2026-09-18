import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  Plus,
  Printer,
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
  User,
  Building,
  AlertCircle,
  Trash2,
  Clock,
  Check
} from 'lucide-react';
import { Material, Requisition, RequisitionItem } from '../types.ts';
import { formatDate } from '../lib/api.ts';

interface RequisitionsViewProps {
  requisitions: Requisition[];
  materials: Material[];
  loading: boolean;
  currentUser: { name: string };
  onCreateRequisition: (data: {
    requester_name: string;
    department: string;
    date: string;
    reason: string;
    notes?: string;
    items: { material_id: number; quantity_requested: number; notes?: string }[];
  }) => Promise<void>;
  onAttendRequisition: (id: number, approvedBy: string) => Promise<void>;
  onCancelRequisition: (id: number) => Promise<void>;
  onOpenPrintRequisition: (req: Requisition) => void;
}

export const RequisitionsView: React.FC<RequisitionsViewProps> = ({
  requisitions,
  materials,
  loading,
  currentUser,
  onCreateRequisition,
  onAttendRequisition,
  onCancelRequisition,
  onOpenPrintRequisition,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // New Requisition Form State
  const [requesterName, setRequesterName] = useState('');
  const [department, setDepartment] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<
    { material_id: number; quantity_requested: number; notes?: string }[]
  >([{ material_id: materials[0]?.id || 1, quantity_requested: 1, notes: '' }]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter requisitions
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter((r) => {
      if (statusFilter !== 'TODOS' && r.status !== statusFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const numMatch = r.req_number?.toLowerCase().includes(q);
        const reqMatch = r.requester_name?.toLowerCase().includes(q);
        const deptMatch = r.department?.toLowerCase().includes(q);
        const reasonMatch = r.reason?.toLowerCase().includes(q);
        if (!numMatch && !reqMatch && !deptMatch && !reasonMatch) return false;
      }

      return true;
    });
  }, [requisitions, statusFilter, searchTerm]);

  // Add Item to requisition draft
  const handleAddItem = () => {
    const firstMat = materials[0];
    setItems((prev) => [
      ...prev,
      { material_id: firstMat?.id || 1, quantity_requested: 1, notes: '' }
    ]);
  };

  // Remove Item from draft
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setFormError('A requisição deve ter no mínimo 1 item.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update item field
  const handleUpdateItem = (index: number, field: string, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Submit Requisition
  const handleSubmitRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!requesterName.trim() || !department.trim() || !reason.trim()) {
      setFormError('Por favor, preencha todos os campos obrigatórios (solicitante, setor, motivo).');
      return;
    }

    if (items.length === 0) {
      setFormError('Adicione pelo menos um item à requisição.');
      return;
    }

    // Validate quantities
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.quantity_requested <= 0) {
        setFormError(`Quantidade do item ${i + 1} deve ser maior que zero.`);
        return;
      }
      const mat = materials.find((m) => m.id === it.material_id);
      if (mat && mat.current_quantity < it.quantity_requested) {
        setFormError(
          `Aviso: O material ${mat.code} - ${mat.description} possui apenas ${mat.current_quantity} ${mat.unit} em estoque (solicitado: ${it.quantity_requested} ${mat.unit}).`
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      await onCreateRequisition({
        requester_name: requesterName.trim(),
        department: department.trim(),
        date,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        items
      });

      setShowCreateModal(false);
      setRequesterName('');
      setDepartment('');
      setReason('');
      setNotes('');
      setItems([{ material_id: materials[0]?.id || 1, quantity_requested: 1, notes: '' }]);
    } catch (err: any) {
      setFormError(err.message || 'Falha ao criar requisição.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            <span>Gestão de Requisições de Material</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Solicitações de retirada, autorização de entrega e emissão de comprovantes impressos
          </p>
        </div>

        <button
          id="btn-open-new-requisition"
          onClick={() => {
            setFormError(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Requisição</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-search-requisitions"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número da requisição, solicitante, setor ou motivo..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder:text-slate-500 focus:border-amber-500 outline-none transition"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('TODOS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              statusFilter === 'TODOS' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas ({requisitions.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDENTE')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              statusFilter === 'PENDENTE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Pendentes
          </button>
          <button
            onClick={() => setStatusFilter('ATENDIDA')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              statusFilter === 'ATENDIDA' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Check className="w-3.5 h-3.5" /> Atendidas
          </button>
        </div>
      </div>

      {/* Requisitions List / Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-slate-900/80 p-12 text-center text-slate-400 rounded-xl border border-slate-800">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Carregando requisições...
          </div>
        ) : filteredRequisitions.length === 0 ? (
          <div className="bg-slate-900/80 p-12 text-center text-slate-400 rounded-xl border border-slate-800">
            Nenhuma requisição encontrada com os filtros selecionados.
          </div>
        ) : (
          filteredRequisitions.map((req) => {
            const isPendente = req.status === 'PENDENTE';
            const isAtendida = req.status === 'ATENDIDA';

            return (
              <div
                key={req.id}
                className="bg-slate-900/80 rounded-xl border border-slate-800 shadow-xs p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  {/* Left: Identifiers */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-amber-400 bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded">
                        {req.req_number}
                      </span>

                      {isAtendida ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ATENDIDA
                        </span>
                      ) : req.status === 'CANCELADA' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300">
                          <XCircle className="w-3.5 h-3.5" /> CANCELADA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                          <Clock className="w-3.5 h-3.5" /> PENDENTE
                        </span>
                      )}

                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" /> {formatDate(req.date)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-white">
                        <User className="w-3.5 h-3.5 text-amber-400" /> {req.requester_name}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Building className="w-3.5 h-3.5 text-blue-400" /> {req.department}
                      </span>
                      {req.approved_by && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-emerald-400 font-medium">
                            Atendido por: {req.approved_by}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* View & Print Button */}
                    <button
                      id={`btn-print-req-${req.id}`}
                      onClick={() => onOpenPrintRequisition(req)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-amber-400" />
                      <span>Visualizar / Imprimir</span>
                    </button>

                    {/* Attend Button (if pending) */}
                    {isPendente && (
                      <button
                        id={`btn-attend-req-${req.id}`}
                        onClick={() => onAttendRequisition(req.id, currentUser.name)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Baixar Estoque / Atender</span>
                      </button>
                    )}

                    {/* Cancel Button */}
                    {isPendente && (
                      <button
                        id={`btn-cancel-req-${req.id}`}
                        onClick={() => onCancelRequisition(req.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Cancelar Requisição"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Reason & Items preview */}
                <div className="pt-3">
                  <p className="text-xs text-slate-300 mb-3 font-medium">
                    <span className="text-slate-500 uppercase text-[10px] font-bold block mb-0.5">Motivo:</span>
                    {req.reason}
                  </p>

                  <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                      Itens Requisitados ({req.items?.length || 0})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {req.items?.map((it) => (
                        <div
                          key={it.id}
                          className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs flex items-center justify-between gap-2"
                        >
                          <div className="truncate">
                            <span className="font-semibold text-slate-100 block truncate">
                              {it.material_description}
                            </span>
                            <span className="font-mono text-[10px] text-amber-400/80">
                              {it.material_code}
                            </span>
                          </div>
                          <span className="font-bold font-mono text-white shrink-0 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px]">
                            {it.quantity_requested} {it.material_unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal to Create Requisition */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Nova Requisição de Material</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequisition} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome do Solicitante *
                  </label>
                  <input
                    id="input-req-requester"
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo / Equipe Elétrica"
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl focus:border-amber-500 outline-none text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Departamento / Setor *
                  </label>
                  <input
                    id="input-req-department"
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Ex: Manutenção Industrial"
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl focus:border-amber-500 outline-none text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Data da Solicitação *
                  </label>
                  <input
                    id="input-req-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl focus:border-amber-500 outline-none text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Motivo / Destinação do Material *
                  </label>
                  <input
                    id="input-req-reason"
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Manutenção preventiva dos motores do Bloco C"
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl focus:border-amber-500 outline-none text-white"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Itens a Requisitar ({items.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Item
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {items.map((item, index) => {
                    const mat = materials.find((m) => m.id === item.material_id);

                    return (
                      <div
                        key={index}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                      >
                        {/* Select Material */}
                        <div className="flex-1">
                          <select
                            required
                            value={item.material_id}
                            onChange={(e) =>
                              handleUpdateItem(index, 'material_id', Number(e.target.value))
                            }
                            className="w-full px-2.5 py-2 text-xs border border-slate-700 rounded-lg bg-slate-900 text-slate-200 outline-none font-medium focus:border-amber-500"
                          >
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>
                                [{m.code}] {m.description} (Disp: {m.current_quantity} {m.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="w-28 flex items-center gap-1">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            required
                            value={item.quantity_requested}
                            onChange={(e) =>
                              handleUpdateItem(index, 'quantity_requested', Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg outline-none font-bold text-white focus:border-amber-500"
                            placeholder="Qtd"
                          />
                          <span className="text-[11px] font-bold text-slate-400 font-mono">
                            {mat?.unit || 'UN'}
                          </span>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer self-end sm:self-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-submit-requisition"
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Emitindo...' : 'Emitir Requisição'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
