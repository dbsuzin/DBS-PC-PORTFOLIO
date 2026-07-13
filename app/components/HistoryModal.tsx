'use client';

import React, { useState, useEffect } from 'react';
import { X, History, ArrowRight } from 'lucide-react';

interface HistoryEntry {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  createdAt: string;
}

interface HistoryModalProps {
  computerId: string;
  hostname: string;
  onClose: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  hostname: 'Hostname', manufacturer: 'Fabricante', model: 'Modelo',
  serialNumber: 'N° Série', cpu: 'CPU', cpuCores: 'Núcleos',
  ramGB: 'RAM', diskGB: 'Disco', gpu: 'GPU', os: 'SO',
  osVersion: 'Versão SO', ipAddress: 'IP', macAddress: 'MAC',
  biosVersion: 'BIOS', notes: 'Notas', disks: 'Discos',
  purchaseDate: 'Data Compra', warrantyExpiry: 'Garantia',
  assetTag: 'Tag Ativo', status: 'Status',
};

export default function HistoryModal({ computerId, hostname, onClose }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [computerId]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/computers/${computerId}/history`);
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-6" onClick={onClose}>
      <div className="modal card w-full max-w-2xl max-h-[80vh] overflow-auto p-6 shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-sky-400" />
            <h3 className="text-xl font-semibold glow-text">Histórico — {hostname}</h3>
          </div>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-zinc-400 text-sm">Carregando...</div>
        ) : history.length === 0 ? (
          <div className="py-10 text-center text-zinc-500 text-sm">Nenhuma alteração registrada.</div>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="bg-zinc-950/50 border border-zinc-800/50 rounded-lg p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sky-400">{FIELD_LABELS[entry.field] || entry.field}</span>
                  <span className="text-zinc-500">{formatDate(entry.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="text-red-400/80 line-through truncate max-w-[200px]">{entry.oldValue || 'vazio'}</span>
                  <ArrowRight className="h-3 w-3 text-zinc-500 flex-shrink-0" />
                  <span className="text-emerald-400/80 truncate max-w-[200px]">{entry.newValue || 'vazio'}</span>
                </div>
                <div className="text-[10px] text-zinc-600 mt-1">por {entry.changedBy}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
