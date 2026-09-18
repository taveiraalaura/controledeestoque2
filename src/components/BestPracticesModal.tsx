import React from 'react';
import {
  BookOpen,
  X,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  BarChart2,
  Layers,
  Award
} from 'lucide-react';

interface BestPracticesModalProps {
  onClose: () => void;
}

export const BestPracticesModal: React.FC<BestPracticesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Manual de Boas Práticas de Almoxarifado
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full uppercase">
                  Guia Técnico
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Padrões operacionais e diretrizes para gestão segura e eficiente de inventário.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed">
          {/* Section 1 */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2 text-amber-400">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              1. Controle de Movimentação Rigoroso (PEPS / FIFO)
            </h4>
            <p className="text-slate-400 mb-2">
              Todas as entradas e saídas devem ser registradas no mesmo dia da ocorrência física. Nenhuma retirada de material pode ocorrer sem documento comprobatório (Requisição ou Ordem de Serviço).
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Adotar o método <strong>PEPS (Primeiro que Entra, Primeiro que Sai)</strong> para itens perecíveis ou sujeitos a oxidação.</li>
              <li>Exigir assinatura de retirada no ato de entrega física do material.</li>
              <li>Verificar conferência de nota fiscal e inspeção de avarias antes de lançar a entrada no sistema.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2 text-amber-400">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              2. Classificação ABC e Estoque de Segurança
            </h4>
            <p className="text-slate-400 mb-2">
              Otimize a alocação de capital e a frequência de contagem física através da classificação por valor e criticidade:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="font-bold text-amber-400 block text-xs mb-1">Classe A (Alta Criticidade)</span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Aproximadamente 20% dos itens que representam 80% do valor do estoque. Contagem semanal ou quinzenal.
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="font-bold text-blue-400 block text-xs mb-1">Classe B (Intermediária)</span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Aproximadamente 30% dos itens correspondendo a 15% do valor total. Contagem mensal.
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="font-bold text-emerald-400 block text-xs mb-1">Classe C (Baixo Impacto)</span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Cerca de 50% dos itens que somam apenas 5% do valor financeiro imobilizado. Contagem trimestral.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2 text-amber-400">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              3. Integridade dos Dados e Transações Atômicas
            </h4>
            <p className="text-slate-400 mb-2">
              O sistema utiliza integridade referencial com banco de dados SQLite nativo (<code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">PRAGMA foreign_keys = ON</code>) e script compatível com PostgreSQL:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Bloqueio de exclusão em materiais que possuam histórico de movimentações (<code className="text-amber-300">ON DELETE RESTRICT</code>).</li>
              <li>Baixas automáticas de requisição executadas sob transações atômicas com verificação imediata de saldo em tempo real.</li>
              <li>Impossibilidade de saldo negativo por validação dupla tanto na camada de frontend quanto no motor relacional SQL.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2 text-amber-400">
              <Layers className="w-4 h-4 text-amber-400" />
              4. Endereçamento e Sinalização Física
            </h4>
            <p className="text-slate-400 mb-2">
              Todo item cadastrado no sistema possui seu campo de localização física (ex: <em>Prateleira A-1</em>, <em>Rack C-3</em>, <em>Armário B-2</em>). Garanta que os códigos estejam claramente etiquetados nas gôndolas e caixas organizadoras para agilizar a separação e o inventário rotativo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Responsável Técnico: <strong className="text-white">Laura Taveira</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer transition shadow-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
