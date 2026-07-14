'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseResizableColumnsOptions {
  storageKey: string;
  defaultWidths: Record<string, number>;
  minWidth?: number;
}

export function useResizableColumns({ storageKey, defaultWidths, minWidth = 40 }: UseResizableColumnsOptions) {
  const [widths, setWidths] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return defaultWidths;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(widths));
  }, [widths, storageKey]);

  const resizingRef = useRef<{ colKey: string; startX: number; startWidth: number } | null>(null);

  const handleMouseDown = useCallback((colKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    const startWidth = widths[colKey] || 100;
    resizingRef.current = { colKey, startX: e.clientX, startWidth };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const diff = ev.clientX - resizingRef.current.startX;
      const newWidth = Math.max(minWidth, resizingRef.current.startWidth + diff);
      setWidths(prev => ({ ...prev, [resizingRef.current!.colKey]: newWidth }));
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [widths, minWidth]);

  const getStyle = useCallback((colKey: string): React.CSSProperties => ({
    width: widths[colKey] || 100,
    minWidth: widths[colKey] || 100,
    maxWidth: widths[colKey] || 100,
  }), [widths]);

  return { handleMouseDown, getStyle, widths };
}
