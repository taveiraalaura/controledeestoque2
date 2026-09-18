import React, { useState, useEffect, useCallback } from 'react';
import { EnterpriseHeader } from './components/EnterpriseHeader.tsx';
import { EnterpriseSidebar, AppModule } from './components/EnterpriseSidebar.tsx';
import { Footer } from './components/Footer.tsx';
import { KPIsView } from './components/KPIsView.tsx';
import { StockReportView } from './components/StockReportView.tsx';
import { MovementsView } from './components/MovementsView.tsx';
import { RequisitionsView } from './components/RequisitionsView.tsx';
import { SectorsView } from './components/SectorsView.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { MaterialModal } from './components/MaterialModal.tsx';
import { PrintStockReportModal } from './components/PrintStockReportModal.tsx';
import { PrintRequisitionModal } from './components/PrintRequisitionModal.tsx';
import { SetupGuideModal } from './components/SetupGuideModal.tsx';
import { BestPracticesModal } from './components/BestPracticesModal.tsx';
import { ServerErrorScreen } from './components/ServerErrorScreen.tsx';
import {
  fetchMaterials,
  fetchMovements,
  fetchRequisitions,
  fetchKPIs,
  fetchSectors,
  createMaterial,
  updateMaterial,
  createMovement,
  createRequisition,
  attendRequisition,
  cancelRequisition,
  createSector,
  updateSector,
  deleteSector,
  resetDemoData
} from './lib/api.ts';
import {
  Material,
  Movement,
  Requisition,
  StockKPIs,
  User,
  Sector,
  MovementType
} from './types.ts';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('estoque_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default preset for frictionless first experience
    return {
      id: 1,
      username: 'admin',
      name: 'Laura Taveira',
      role: 'Responsável Técnico',
    };
  });

  // Navigation Module State (Enterprise Navigation)
  const [activeModule, setActiveModule] = useState<AppModule>('kpis');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Application Data
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [kpis, setKpis] = useState<StockKPIs | null>(null);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resettingDemo, setResettingDemo] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Modals State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showBestPracticesModal, setShowBestPracticesModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);

  // Print Modals State
  const [printStockMaterials, setPrintStockMaterials] = useState<Material[] | null>(null);
  const [printStockCategory, setPrintStockCategory] = useState<string | undefined>(undefined);
  const [printRequisitionData, setPrintRequisitionData] = useState<Requisition | null>(null);

  // Quick Movement Launcher from Stock Table
  const [preSelectedMaterial, setPreSelectedMaterial] = useState<Material | null>(null);

  // Fetch all core datasets
  const loadAllData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [mats, sects, movs, reqs, kpiData] = await Promise.all([
        fetchMaterials(),
        fetchSectors().catch(() => []),
        fetchMovements(),
        fetchRequisitions(),
        fetchKPIs()
      ]);

      setMaterials(mats);
      setSectors(sects);
      setMovements(movs);
      setRequisitions(reqs);
      setKpis(kpiData);
      setServerError(null);
    } catch (err: any) {
      console.error('Failed to load application data', err);
      const errMsg = err.message || 'Erro ao comunicar com o servidor';
      setServerError(errMsg);
      showToast('error', errMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Auth Handlers
  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('estoque_user', JSON.stringify(user));
    localStorage.setItem('estoque_token', token);
    setShowLoginModal(false);
    showToast('success', `Bem-vindo(a), ${user.name}!`);
    loadAllData(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('estoque_user');
    localStorage.removeItem('estoque_token');
    setCurrentUser(null);
    setShowLoginModal(true);
  };

  // Demo Reset Handler
  const handleResetDemo = async () => {
    if (!confirm('Deseja recarregar a base com os dados iniciais de demonstração (SKUs, setores, requisições)?')) {
      return;
    }
    setResettingDemo(true);
    try {
      await resetDemoData();
      showToast('success', 'Base de demonstração recarregada com sucesso!');
      await loadAllData(true);
    } catch (err: any) {
      showToast('error', err.message || 'Falha ao recarregar dados demo.');
    } finally {
      setResettingDemo(false);
    }
  };

  // Material Actions
  const handleSaveMaterial = async (data: Partial<Material>) => {
    try {
      if (materialToEdit) {
        await updateMaterial(materialToEdit.id, data);
        showToast('success', `Material "${data.description || materialToEdit.description}" atualizado!`);
      } else {
        await createMaterial(data);
        showToast('success', `Material "${data.description}" cadastrado com sucesso!`);
      }
      setShowMaterialModal(false);
      setMaterialToEdit(null);
      await loadAllData(true);
    } catch (err: any) {
      showToast('error', err.message || 'Falha ao salvar material.');
      throw err;
    }
  };

  // Sector Actions
  const handleSaveSector = async (data: Partial<Sector>, id?: number) => {
    try {
      if (id) {
        await updateSector(id, data);
        showToast('success', `Setor "${data.name}" atualizado com sucesso!`);
      } else {
        await createSector(data);
        showToast('success', `Setor "${data.name}" cadastrado com sucesso!`);
      }
      await loadAllData(true);
    } catch (err: any) {
      showToast('error', err.message || 'Falha ao salvar setor.');
      throw err;
    }
  };

  const handleDeleteSector = async (id: number) => {
    try {
      await deleteSector(id);
      showToast('success', 'Setor excluído com sucesso.');
      await loadAllData(true);
    } catch (err: any) {
      showToast('error', err.message || 'Falha ao excluir setor.');
      throw err;
    }
  };

  // Movement Action
  const handleRecordMovement = async (data: {
    material_id: number;
    type: MovementType;
    quantity: number;
    date: string;
    reason: string;
    document_ref?: string;
    unit_price?: number;
    responsible: string;
    notes?: string;
  }) => {
    try {
      const result = await createMovement(data);
      const actionText = data.type === 'ENTRADA' ? 'Entrada registrada' : 'Saída registrada';
      showToast(
        'success',
        `${actionText} com sucesso! Novo saldo físico: ${result.newStock}`
      );
      setPreSelectedMaterial(null);
      await loadAllData(true);
    } catch (err: any) {
      showToast('error', err.message || 'Falha ao registrar movimentação.');
      throw err;
    }
  };

  // Requisition Actions
  const handleCreateRequisition = async (data: {
    requester_name: string;
    department: string;
    date: string;
    reason: string;
    notes?: string;
    items: { material_id: number; quantity_requested: number; notes?: string }[];
  }) => {
    try {
      const result = await createRequisition(data);
      showToast('success', `Requisição ${result.req_number} emitida com sucesso!`);
      await loadAllData(true);
    } catch (err: any) {
      showToast('error', err.message || 'Falha ao emitir requisição.');
      throw err;
    }
  };

  const handleAttendRequisition = async (id: number, approvedBy: string) => {
    try {
      const result = await attendRequisition(id, approvedBy);
      showToast(
        'success',
        `Requisição ${result.requisition?.req_number || id} atendida com sucesso! O estoque foi baixado automaticamente.`
      );
      await loadAllData(true);
    } catch (err: any) {
      showToast('error', err.message || 'Falha ao atender requisição.');
      throw err;
    }
  };

  const handleCancelRequisition = async (id: number) => {
    try {
      await cancelRequisition(id);
      showToast('success', 'Requisição cancelada com sucesso.');
      await loadAllData(true);
    } catch (err: any) {
      showToast('error', err.message || 'Falha ao cancelar requisição.');
      throw err;
    }
  };

  // If not logged in, render login modal
  if (!currentUser || showLoginModal) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  const pendingReqsCount = requisitions.filter((r) => r.status === 'PENDENTE').length;
  const lowStockCount = kpis?.lowStockCount || 0;

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full no-print animate-in fade-in slide-in-from-top-2 duration-300">
          <div
            className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Enterprise Header */}
      <EnterpriseHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenBestPractices={() => setShowBestPracticesModal(true)}
        onResetDemo={handleResetDemo}
        resettingDemo={resettingDemo}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Layout with Left Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">
        {/* Enterprise Sidebar */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block`}>
          <EnterpriseSidebar
            activeModule={activeModule}
            setActiveModule={(mod) => {
              setActiveModule(mod);
              setMobileMenuOpen(false);
            }}
            onOpenBestPractices={() => setShowBestPracticesModal(true)}
            pendingRequisitionsCount={pendingReqsCount}
            lowStockCount={lowStockCount}
          />
        </div>

        {/* Central View Area */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 overflow-x-hidden min-w-0">
          {/* Server Connection Error Screen (when error happens and no data) */}
          {serverError && materials.length === 0 ? (
            <ServerErrorScreen
              error={serverError}
              onRetry={() => loadAllData()}
              onResetDemo={handleResetDemo}
              retrying={loading}
            />
          ) : (
            <>
              {activeModule === 'kpis' && (
                <KPIsView
                  kpis={kpis}
                  loading={loading || refreshing}
                  onRefresh={() => loadAllData(true)}
                  onNavigateToStock={() => setActiveModule('materials')}
                  onNavigateToMovements={() => setActiveModule('movements')}
                />
              )}

              {(activeModule === 'materials' || activeModule === 'reports') && (
                <StockReportView
                  materials={materials}
                  loading={loading}
                  onOpenNewMaterial={() => {
                    setMaterialToEdit(null);
                    setShowMaterialModal(true);
                  }}
                  onEditMaterial={(mat) => {
                    setMaterialToEdit(mat);
                    setShowMaterialModal(true);
                  }}
                  onOpenMovementForMaterial={(mat) => {
                    setPreSelectedMaterial(mat);
                    setActiveModule('movements');
                  }}
                  onOpenPrintReport={(filteredList, category) => {
                    setPrintStockMaterials(filteredList);
                    setPrintStockCategory(category);
                  }}
                />
              )}

              {activeModule === 'sectors' && (
                <SectorsView
                  sectors={sectors}
                  loading={loading}
                  onRefresh={() => loadAllData(true)}
                  onSaveSector={handleSaveSector}
                  onDeleteSector={handleDeleteSector}
                  onNavigateToRequisitions={() => setActiveModule('requisitions')}
                />
              )}

              {activeModule === 'movements' && (
                <MovementsView
                  movements={movements}
                  materials={materials}
                  loading={loading}
                  currentUser={currentUser}
                  preSelectedMaterial={preSelectedMaterial}
                  onRecordMovement={handleRecordMovement}
                  onClearPreSelectedMaterial={() => setPreSelectedMaterial(null)}
                />
              )}

              {activeModule === 'requisitions' && (
                <RequisitionsView
                  requisitions={requisitions}
                  materials={materials}
                  loading={loading}
                  currentUser={currentUser}
                  onCreateRequisition={handleCreateRequisition}
                  onAttendRequisition={handleAttendRequisition}
                  onCancelRequisition={handleCancelRequisition}
                  onOpenPrintRequisition={(req) => setPrintRequisitionData(req)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mandatory Footer with "Laura Taveira - Responsável Técnico" */}
      <Footer />

      {/* Modals */}
      {showBestPracticesModal && (
        <BestPracticesModal onClose={() => setShowBestPracticesModal(false)} />
      )}

      {showMaterialModal && (
        <MaterialModal
          materialToEdit={materialToEdit}
          onSave={handleSaveMaterial}
          onClose={() => {
            setShowMaterialModal(false);
            setMaterialToEdit(null);
          }}
        />
      )}

      {printStockMaterials && (
        <PrintStockReportModal
          materials={printStockMaterials}
          categoryFilter={printStockCategory}
          onClose={() => setPrintStockMaterials(null)}
        />
      )}

      {printRequisitionData && (
        <PrintRequisitionModal
          requisition={printRequisitionData}
          onClose={() => setPrintRequisitionData(null)}
        />
      )}

      {showSetupModal && (
        <SetupGuideModal onClose={() => setShowSetupModal(false)} />
      )}
    </div>
  );
}
