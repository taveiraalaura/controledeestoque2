import React from 'react';
import { AlertTriangle, RefreshCw, Database, RotateCcw, CheckCircle2 } from 'lucide-react';

interface ServerErrorScreenProps {
  error: string;
  onRetry: () => void;
  onResetDemo: () => void;
  retrying: boolean;
}

export const ServerErrorScreen: React.FC<ServerErrorScreenProps> = ({
  error,
  onRetry,
  onResetDemo,
  retrying
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh] animate-in fade-in zoom-in-95 duration-200">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
        {/* Red Shield Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto shadow-inner">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Falha ao Conectar com o Servidor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Não foi possível carregar as informações do estoque ou os serviços de backend estão inicializando.
          </p>
        </div>

        {/* Error Details Box */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-left font-mono text-[11px] text-rose-300 break-words">
          <span className="text-slate-500 select-none block mb-1">Diagnóstico do Erro:</span>
          {error}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <button
            id="btn-retry-connection"
            onClick={onRetry}
            disabled={retrying}
            className="w-full sm:flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
            <span>{retrying ? 'Reconectando...' : 'Tentar Novamente'}</span>
          </button>

          <button
            onClick={onResetDemo}
            disabled={retrying}
            className="w-full sm:w-auto py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-700 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Recarregar Demo</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
          Responsável Técnico: <strong className="text-slate-300">Laura Taveira</strong> • SQLite Ativo
        </p>
      </div>
    </div>
  );
};
